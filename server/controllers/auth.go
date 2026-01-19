package controllers

import (
	"kubeswitch/server/database"
	"kubeswitch/server/models"
	"kubeswitch/server/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type LoginInput struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.Where("username = ?", input.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if !utils.CheckPasswordHash(input.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	utils.LogAudit(user.ID, "Login", "User logged in", c.ClientIP())

	c.JSON(http.StatusOK, gin.H{"token": token, "role": user.Role})
}

func Logout(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	utils.LogAudit(userID, "Logout", "User logged out", c.ClientIP())
	c.JSON(http.StatusOK, gin.H{"message": "Logged out"})
}

func GetCurrentUser(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"username": user.Username, "role": user.Role})
}
