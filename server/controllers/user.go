package controllers

import (
	"kubeswitch/server/database"
	"kubeswitch/server/models"
	"kubeswitch/server/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CreateUserInput struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Role     string `json:"role" binding:"required,oneof=admin user"`
}

func GetUsers(c *gin.Context) {
	var users []models.User
	database.DB.Find(&users)
	c.JSON(http.StatusOK, users)
}

func CreateUser(c *gin.Context) {
	var input CreateUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, err := utils.HashPassword(input.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user := models.User{
		Username: input.Username,
		Password: hashedPassword,
		Role:     input.Role,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create user (username might exist)"})
		return
	}

	c.JSON(http.StatusCreated, user)
}

type SetPermissionsInput struct {
	ClusterIDs []uint `json:"cluster_ids" binding:"required"`
}

func SetUserPermissions(c *gin.Context) {
	userID := c.Param("id")
	var input SetPermissionsInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Transaction to update permissions
	tx := database.DB.Begin()
	
	// Remove existing permissions
	if err := tx.Where("user_id = ?", user.ID).Delete(&models.Permission{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear permissions"})
		return
	}

	// Add new permissions
	for _, clusterID := range input.ClusterIDs {
		perm := models.Permission{
			UserID:    user.ID,
			ClusterID: clusterID,
		}
		if err := tx.Create(&perm).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add permission"})
			return
		}
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "Permissions updated"})
}

func GetUserPermissions(c *gin.Context) {
	userID := c.Param("id")
	var perms []models.Permission
	if err := database.DB.Where("user_id = ?", userID).Find(&perms).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch permissions"})
		return
	}
	
	var clusterIDs []uint
	for _, p := range perms {
		clusterIDs = append(clusterIDs, p.ClusterID)
	}
	
	c.JSON(http.StatusOK, gin.H{"cluster_ids": clusterIDs})
}
