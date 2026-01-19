package cmd

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var loginCmd = &cobra.Command{
	Use:   "login",
	Short: "Login to the server",
	Run: func(cmd *cobra.Command, args []string) {
		serverURL := viper.GetString("server_url")
		if serverURL == "" {
			fmt.Println("Server URL not set. Use 'ks config set-server <url>'")
			return
		}

		var username, password string
		fmt.Print("Username: ")
		fmt.Scanln(&username)
		fmt.Print("Password: ")
		fmt.Scanln(&password)

		data := map[string]string{
			"username": username,
			"password": password,
		}
		jsonData, _ := json.Marshal(data)

		resp, err := http.Post(serverURL+"/api/login", "application/json", bytes.NewBuffer(jsonData))
		if err != nil {
			fmt.Println("Error connecting to server:", err)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			fmt.Println("Login failed. Check credentials.")
			return
		}

		var result map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&result)
		token := result["token"].(string)

		viper.Set("token", token)
		if err := viper.WriteConfig(); err != nil {
			viper.SafeWriteConfig()
		}
		fmt.Println("Login successful!")
	},
}

var logoutCmd = &cobra.Command{
	Use:   "logout",
	Short: "Logout",
	Run: func(cmd *cobra.Command, args []string) {
		serverURL := viper.GetString("server_url")
		token := viper.GetString("token")

		if serverURL != "" && token != "" {
			req, _ := http.NewRequest("POST", serverURL+"/api/logout", nil)
			req.Header.Set("Authorization", "Bearer "+token)
			http.DefaultClient.Do(req)
		}

		viper.Set("token", "")
		viper.WriteConfig()
		fmt.Println("Logged out.")
	},
}

func init() {
	rootCmd.AddCommand(loginCmd)
	rootCmd.AddCommand(logoutCmd)
}
