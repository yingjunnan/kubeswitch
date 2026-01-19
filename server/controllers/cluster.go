package controllers

import (
	"kubeswitch/server/database"
	"kubeswitch/server/models"
	"kubeswitch/server/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CreateClusterInput struct {
	Name        string `json:"name" binding:"required"`
	Kubeconfig  string `json:"kubeconfig" binding:"required"`
	Description string `json:"description"`
}

func CreateCluster(c *gin.Context) {
	var input CreateClusterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cluster := models.Cluster{
		Name:        input.Name,
		Kubeconfig:  input.Kubeconfig,
		Description: input.Description,
	}

	if err := database.DB.Create(&cluster).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create cluster"})
		return
	}

	userID := c.MustGet("user_id").(uint)
	utils.LogAudit(userID, "CreateCluster", "Created cluster "+cluster.Name, c.ClientIP())

	c.JSON(http.StatusCreated, cluster)
}

func GetClusters(c *gin.Context) {
	role := c.MustGet("role").(string)
	userID := c.MustGet("user_id").(uint)

	var clusters []models.Cluster

	if role == "admin" {
		database.DB.Find(&clusters)
	} else {
		// Find clusters where user has permission
		var permissions []models.Permission
		database.DB.Where("user_id = ?", userID).Find(&permissions)
		
		var clusterIDs []uint
		for _, p := range permissions {
			clusterIDs = append(clusterIDs, p.ClusterID)
		}

		if len(clusterIDs) > 0 {
			database.DB.Where("id IN ?", clusterIDs).Find(&clusters)
		}
	}

	c.JSON(http.StatusOK, clusters)
}

func GetClusterConfig(c *gin.Context) {
	clusterID := c.Param("id")
	userID := c.MustGet("user_id").(uint)
	role := c.MustGet("role").(string)

	// Check permission
	if role != "admin" {
		var perm models.Permission
		if err := database.DB.Where("user_id = ? AND cluster_id = ?", userID, clusterID).First(&perm).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			return
		}
	}

	var cluster models.Cluster
	if err := database.DB.First(&cluster, clusterID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cluster not found"})
		return
	}

	utils.LogAudit(userID, "GetConfig", "Retrieved config for "+cluster.Name, c.ClientIP())

	c.JSON(http.StatusOK, gin.H{"kubeconfig": cluster.Kubeconfig})
}

func DeleteCluster(c *gin.Context) {
	clusterID := c.Param("id")
	
	if err := database.DB.Delete(&models.Cluster{}, clusterID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete cluster"})
		return
	}

	userID := c.MustGet("user_id").(uint)
	utils.LogAudit(userID, "DeleteCluster", "Deleted cluster "+clusterID, c.ClientIP())

	c.JSON(http.StatusOK, gin.H{"message": "Cluster deleted"})
}

type SetClusterPermissionsInput struct {
	UserIDs []uint `json:"user_ids" binding:"required"`
}

func SetClusterPermissions(c *gin.Context) {
	clusterID := c.Param("id")
	var input SetClusterPermissionsInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var cluster models.Cluster
	if err := database.DB.First(&cluster, clusterID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cluster not found"})
		return
	}

	// Transaction to update permissions
	tx := database.DB.Begin()
	
	// Remove existing permissions for this cluster
	if err := tx.Where("cluster_id = ?", cluster.ID).Delete(&models.Permission{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear permissions"})
		return
	}

	// Add new permissions
	for _, userID := range input.UserIDs {
		perm := models.Permission{
			UserID:    userID,
			ClusterID: cluster.ID,
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

func GetClusterPermissions(c *gin.Context) {
	clusterID := c.Param("id")
	var perms []models.Permission
	if err := database.DB.Where("cluster_id = ?", clusterID).Find(&perms).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch permissions"})
		return
	}
	
	var userIDs []uint
	for _, p := range perms {
		userIDs = append(userIDs, p.UserID)
	}
	
	c.JSON(http.StatusOK, gin.H{"user_ids": userIDs})
}
