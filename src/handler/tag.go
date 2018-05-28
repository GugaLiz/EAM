package handler

import (
	"github.com/gin-gonic/gin"
	"log"
	"model"
)

func InitTag(e *gin.Engine, r *gin.RouterGroup) {
	r.GET("/tag", listTag)
}

func listTag(c *gin.Context) {
	var pb pageBind
	if err := c.BindQuery(&pb); err != nil {
		log.Fatal(err)
	}
	pb.CheckDefault()
	var list []model.User
	sql1 := `
    SELECT COUNT(id) FROM "user" 
    `
	sql := `
    SELECT * FROM "user" 
    ORDER BY create_time desc
    LIMIT ? offset ?
    `
	var total int64
	if _, err := db.QueryOne(&total, sql1); err != nil {
		log.Fatal(err)
	}
	if _, err := db.Query(&list, sql, pb.PageSize, pb.Index); err != nil {
		log.Fatal(err)
	}
	c.JSON(200, gin.H{
		"list":       list,
		"pagination": pb.Response(total),
	})
}
