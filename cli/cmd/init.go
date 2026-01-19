package cmd

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Initialize KubeSwitch configuration",
	Run: func(cmd *cobra.Command, args []string) {
		reader := bufio.NewReader(os.Stdin)
		fmt.Print("Enter Server URL (default: http://localhost:8080): ")
		url, _ := reader.ReadString('\n')
		url = strings.TrimSpace(url)

		if url == "" {
			url = "http://localhost:8080"
		}
		
		url = strings.TrimRight(url, "/")
		viper.Set("server_url", url)

		// Try to write to existing config file
		if err := viper.WriteConfig(); err != nil {
			// If file doesn't exist, create it in home directory
			home, err := os.UserHomeDir()
			if err != nil {
				fmt.Println("Error getting home directory:", err)
				return
			}
			configPath := filepath.Join(home, ".kubeswitch.yaml")
			if err := viper.WriteConfigAs(configPath); err != nil {
				fmt.Println("Error writing config:", err)
				return
			}
			fmt.Println("Configuration file created at:", configPath)
		} else {
			fmt.Println("Configuration file updated:", viper.ConfigFileUsed())
		}
		
		fmt.Println("Server URL set to:", url)
	},
}

func init() {
	rootCmd.AddCommand(initCmd)
}
