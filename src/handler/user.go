package handler

import (
	"github.com/gin-gonic/gin"
	"log"
	"model"
)

func InitUser(e *gin.Engine, r *gin.RouterGroup) {
	r.GET("/user", listUser)
	r.GET("/user/currentinfo", currentInfo)
	r.POST("/user/updatecurrent", updateCurrent)
	r.POST("/user/updatepwd", updatePwd)
}

func currentInfo(c *gin.Context) {
	if user, err := getCurrentUser(c); err != nil {
		log.Println(err)
		c.JSON(401, gin.H{
			"status": "error",
		})
	} else {
		c.JSON(200, gin.H{
			"Name":    user.Name,
			"Account": user.Account,
			"Phone":   user.Phone,
			"Email":   user.Email,
		})
	}
}

func listUser(c *gin.Context) {
	var pb pageBind
	if err := c.BindQuery(&pb); err != nil {
		log.Fatal(err)
	}
	pb.CheckDefault()
	/*var list []model.User
	_, err := db.Query(&list, `SELECT * FROM "user"`)
	log.Println(err)*/
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

type currentModel struct {
	Name  string `json:"Name"`
	Email string `json:"Email"`
	Phone string `json:"Phone"`
}

func updateCurrent(c *gin.Context) {
	var m currentModel
	if err := c.Bind(&m); err != nil {
		log.Println(err)
		c.JSON(500, gin.H{
			"status": "error",
		})
		return
	}
	if user, err := getCurrentUser(c); err != nil {
		c.JSON(500, gin.H{
			"status": "error",
		})
		return
	} else {
		user.Name = m.Name
		user.Phone = m.Phone
		user.Email = m.Email
		if err := db.Update(user); err != nil {
			c.JSON(500, gin.H{
				"status": "error",
			})
			return
		}
	}

	c.JSON(200, gin.H{
		"status":  "error",
		"message": "account or password error",
	})
	/*
		c.JSON(200, gin.H{
			"status": "ok",
		})*/
}

type pwdModel struct {
	NewPass string `json:"newpass"`
	OldPass string `json:"oldpass"`
}

func updatePwd(c *gin.Context) {
	var m pwdModel
	if err := c.Bind(&m); err != nil {
		log.Println(err)
	}
	if user, err := getCurrentUser(c); err != nil {
		c.JSON(500, gin.H{
			"status": "error",
		})
		return
	} else {
		oldpass := Md5WithHash(m.OldPass)
		if oldpass != user.Password {
			c.JSON(200, gin.H{
				"status":  "error",
				"message": "account or password error",
			})
			return
		}
		npass := Md5WithHash(m.NewPass)
		user.Password = npass
		if err := db.Update(user); err != nil {
			c.JSON(500, gin.H{
				"status": "error",
			})
			return
		}
	}
	log.Println("update pwd ok.")
	c.JSON(200, gin.H{
		"status": "ok",
	})
}
