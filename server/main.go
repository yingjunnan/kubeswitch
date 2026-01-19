package main

import (
	"kubeswitch/server/controllers"
	"kubeswitch/server/database"
	"kubeswitch/server/middleware"
	"kubeswitch/server/models"
	"kubeswitch/server/utils"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	database.Connect()

	// Seed Admin
	var admin models.User
	if err := database.DB.Where("username = ?", "admin").First(&admin).Error; err != nil {
		hash, _ := utils.HashPassword("admin123")
		admin = models.User{Username: "admin", Password: hash, Role: "admin"}
		database.DB.Create(&admin)
		log.Println("Created default admin user (admin/admin123)")
	}

	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowHeaders = append(config.AllowHeaders, "Authorization")
	r.Use(cors.New(config))

	api := r.Group("/api")
	{
		api.POST("/login", controllers.Login)

		authorized := api.Group("/")
		authorized.Use(middleware.AuthMiddleware())
		{
			authorized.POST("/logout", controllers.Logout)
			authorized.GET("/my/user", controllers.GetCurrentUser)
			authorized.GET("/clusters", controllers.GetClusters)
			authorized.GET("/clusters/:id/config", controllers.GetClusterConfig)

			admin := authorized.Group("/")
			admin.Use(middleware.AdminMiddleware())
			{
				admin.GET("/users", controllers.GetUsers)
				admin.POST("/users", controllers.CreateUser)
				admin.GET("/users/:id/permissions", controllers.GetUserPermissions)
				admin.POST("/users/:id/permissions", controllers.SetUserPermissions)

				admin.POST("/clusters", controllers.CreateCluster)
				admin.DELETE("/clusters/:id", controllers.DeleteCluster)

				admin.GET("/audit", controllers.GetAuditLogs)
			}
		}
	}

	r.Run(":8080")
}
