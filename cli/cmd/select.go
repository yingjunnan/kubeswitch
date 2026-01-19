package cmd

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/charmbracelet/bubbles/list"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var docStyle = lipgloss.NewStyle().Margin(1, 2)

type item struct {
	id, title, desc string
}

func (i item) Title() string       { return i.title }
func (i item) Description() string { return i.desc }
func (i item) FilterValue() string { return i.title }

type model struct {
	list       list.Model
	choice     string
	choiceName string
	quitting   bool
}

func (m model) Init() tea.Cmd {
	return nil
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		if msg.String() == "ctrl+c" {
			m.quitting = true
			return m, tea.Quit
		}
		if msg.String() == "enter" {
			i, ok := m.list.SelectedItem().(item)
			if ok {
				m.choice = i.id
				m.choiceName = i.title
			}
			return m, tea.Quit
		}
	case tea.WindowSizeMsg:
		h, v := docStyle.GetFrameSize()
		m.list.SetSize(msg.Width-h, msg.Height-v)
	}

	var cmd tea.Cmd
	m.list, cmd = m.list.Update(msg)
	return m, cmd
}

func (m model) View() string {
	if m.choice != "" {
		return ""
	}
	if m.quitting {
		return "Quit.\n"
	}
	return docStyle.Render(m.list.View())
}

var selectCmd = &cobra.Command{
	Use:   "select",
	Short: "Select a cluster",
	Run: func(cmd *cobra.Command, args []string) {
		serverURL := viper.GetString("server_url")
		token := viper.GetString("token")

		if serverURL == "" || token == "" {
			fmt.Println("Not logged in. Use 'ks login'.")
			os.Exit(1)
		}

		// Fetch clusters
		req, _ := http.NewRequest("GET", serverURL+"/api/clusters", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			fmt.Println("Error fetching clusters:", err)
			os.Exit(1)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			fmt.Println("Failed to fetch clusters. Status:", resp.Status)
			os.Exit(1)
		}

		var clusters []map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&clusters)

		if len(clusters) == 0 {
			fmt.Println("No clusters available.")
			return
		}

		items := []list.Item{}
		for _, c := range clusters {
			id := fmt.Sprintf("%v", c["id"])
			name := c["name"].(string)
			desc := ""
			if c["description"] != nil {
				desc = c["description"].(string)
			}
			items = append(items, item{id: id, title: name, desc: desc})
		}

		l := list.New(items, list.NewDefaultDelegate(), 0, 0)
		l.Title = "Select Cluster"

		m := model{list: l}

		p := tea.NewProgram(m, tea.WithAltScreen())
		finalM, err := p.Run()
		if err != nil {
			fmt.Println("Error:", err)
			os.Exit(1)
		}

		finalModel := finalM.(model)
		if finalModel.choice != "" {
			downloadConfig(finalModel.choice, finalModel.choiceName, serverURL, token)
		}
	},
}

func downloadConfig(clusterID, clusterName, serverURL, token string) {
	req, _ := http.NewRequest("GET", fmt.Sprintf("%s/api/clusters/%s/config", serverURL, clusterID), nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println("Error downloading config:", err)
		os.Exit(1)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		fmt.Println("Failed to download config.")
		os.Exit(1)
	}

	var result map[string]string
	json.NewDecoder(resp.Body).Decode(&result)
	configContent := result["kubeconfig"]

	// Save to file
	home, _ := os.UserHomeDir()
	cacheDir := filepath.Join(home, ".kube", "ks-cache")
	os.MkdirAll(cacheDir, 0755)

	// Use cluster name for filename
	filename := filepath.Join(cacheDir, fmt.Sprintf("%s.yaml", clusterName))
	err = os.WriteFile(filename, []byte(configContent), 0600)
	if err != nil {
		fmt.Println("Error writing file:", err)
		os.Exit(1)
	}

	// Output path to stdout
	fmt.Print(filename)

	// Print help message to Stderr so it doesn't interfere with $(ks select)
	fmt.Fprintf(os.Stderr, "\n\n\033[32m✔ Cluster selected successfully!\033[0m\n")
	fmt.Fprintf(os.Stderr, "Config downloaded to: %s\n\n", filename)
	fmt.Fprintf(os.Stderr, "To use this context in current shell, run:\n")
	fmt.Fprintf(os.Stderr, "  \033[36mexport KUBECONFIG=%s\033[0m\n\n", filename)
	fmt.Fprintf(os.Stderr, "Or add this alias to your shell profile for easier switching:\n")
	fmt.Fprintf(os.Stderr, "  alias kss='export KUBECONFIG=$(ks select)'\n")
}

func init() {
	rootCmd.AddCommand(selectCmd)
}
