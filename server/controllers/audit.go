package controllers

import (
	"kubeswitch/server/database"
	"kubeswitch/server/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetAuditLogs(c *gin.Context) {
	var logs []models.AuditLog
	database.DB.Preload("User").Order("created_at desc").Find(&logs)
	c.JSON(http.StatusOK, logs)
}
