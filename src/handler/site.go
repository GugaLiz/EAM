package handler

import (
	"github.com/gin-gonic/gin"
	"log"
	"model"
)

func InitSite(e *gin.Engine, r *gin.RouterGroup) {
	r.GET("/site", listSite)
}

func listSite(c *gin.Context) {
	var pb pageBind
	if err := c.BindQuery(&pb); err != nil {
		log.Fatal(err)
	}
	pb.CheckDefault()
	var list []model.Site
	sql1 := `
    SELECT COUNT(id) FROM "site" 
    `
	sql := `
    SELECT * FROM "site" 
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
