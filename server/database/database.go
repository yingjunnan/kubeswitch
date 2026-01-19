package database

import (
	"kubeswitch/server/models"
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	var err error
	DB, err = gorm.Open(sqlite.Open("kubeswitch.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	err = DB.AutoMigrate(&models.User{}, &models.Cluster{}, &models.Permission{}, &models.AuditLog{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
}
