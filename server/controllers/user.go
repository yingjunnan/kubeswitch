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

type ChangePasswordInput struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

type AdminChangePasswordInput struct {
	NewPassword string `json:"new_password" binding:"required"`
}

type UpdateUserRoleInput struct {
	Role string `json:"role" binding:"required,oneof=admin user"`
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

func ChangePassword(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	var input ChangePasswordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Verify old password
	if !utils.CheckPasswordHash(input.OldPassword, user.Password) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid old password"})
		return
	}

	// Hash new password
	hashedPassword, err := utils.HashPassword(input.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Update password
	user.Password = hashedPassword
	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	utils.LogAudit(userID, "ChangePassword", "User changed password", c.ClientIP())
	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}

func AdminChangePassword(c *gin.Context) {
	targetUserID := c.Param("id")
	adminUserID := c.MustGet("user_id").(uint)
	
	var input AdminChangePasswordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.First(&user, targetUserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Hash new password
	hashedPassword, err := utils.HashPassword(input.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Update password
	user.Password = hashedPassword
	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	utils.LogAudit(adminUserID, "AdminChangePassword", "Admin changed password for user "+user.Username, c.ClientIP())
	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}

func DeleteUser(c *gin.Context) {
	userID := c.Param("id")
	adminUserID := c.MustGet("user_id").(uint)
	
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Don't allow deleting admin user
	if user.Role == "admin" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete admin user"})
		return
	}

	// Transaction to delete user and related permissions
	tx := database.DB.Begin()
	
	// Delete user permissions first
	if err := tx.Where("user_id = ?", user.ID).Delete(&models.Permission{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user permissions"})
		return
	}

	// Delete user
	if err := tx.Delete(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	tx.Commit()
	utils.LogAudit(adminUserID, "DeleteUser", "Admin deleted user "+user.Username, c.ClientIP())
	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

func UpdateUserRole(c *gin.Context) {
	userID := c.Param("id")
	adminUserID := c.MustGet("user_id").(uint)
	
	var input UpdateUserRoleInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	oldRole := user.Role
	user.Role = input.Role
	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user role"})
		return
	}

	utils.LogAudit(adminUserID, "UpdateUserRole", "Admin changed role for user "+user.Username+" from "+oldRole+" to "+input.Role, c.ClientIP())
	c.JSON(http.StatusOK, gin.H{"message": "User role updated successfully"})
}
