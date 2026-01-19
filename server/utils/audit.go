package utils

import (
	"kubeswitch/server/database"
	"kubeswitch/server/models"
)

func LogAudit(userID uint, action, detail, ip string) {
	log := models.AuditLog{
		UserID:    userID,
		Action:    action,
		Detail:    detail,
		IPAddress: ip,
	}
	database.DB.Create(&log)
}
