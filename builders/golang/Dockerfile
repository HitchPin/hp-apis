ARG OPENAPI_CHANGES_RELEASE=v0.0.76
ARG 
FROM golang:1.24.0-alpine3.21 as build

WORKDIR /go/src/app
RUN apk add git make
RUN git clone https://github.com/pb33f/openapi-changes.git .
RUN git reset --hard $OPENAPI_CHANGES_RELEASE
RUN go mod download
RUN go vet -v
RUN go test -v
ENV CGO_ENABLED=0
RUN make
RUN rm **/*.js

FROM gcr.io/distroless/static-debian12

COPY --from=build /go/src/app/bin /app
CMD ["/app/openapi-changes"]