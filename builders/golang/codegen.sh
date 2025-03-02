#!/bin/sh
go mod init $GOMOD_NAME
go get -tool github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@latest