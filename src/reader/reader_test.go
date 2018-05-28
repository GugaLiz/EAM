package reader

import (
	"fmt"
	"testing"
)

func Test_Main(t *testing.T) {
	var (
		rcuId string
		err   error
	)
	rcuId, err = GetRCUId()
	fmt.Printf("%s, %v\n", rcuId, err)
	comName, err := GetComFile()
	fmt.Printf("%s\n", comName)
}
