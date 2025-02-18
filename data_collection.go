package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func connectDB() *mongo.Client {
	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("connection to MongoDB successful")
	return client
}

func fetchData(url string, target interface{}) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	return json.Unmarshal(body, target)
}

type Product struct {
	ID    int     `bson:"_id,omitempty"`
	Title string  `bson:"title"`
	Price float64 `bson:"price"`
}

func fetchAndInsertProducts(client *mongo.Client) {
	var products []Product
	err := fetchData("https://fakestoreapi.com/products", &products)
	if err != nil {
		log.Fatal(err)
	}

	var productDocs []interface{}
	for _, product := range products {
		productDocs = append(productDocs, product)
	}

	collection := client.Database("online_store").Collection("products")
	_, err = collection.InsertMany(context.TODO(), productDocs)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("products data loaded")
}

func main() {
	client := connectDB()
	defer client.Disconnect(context.TODO())
	fetchAndInsertProducts(client)
}

/*
2️⃣ Products (Товары) — Fake Store API
Источник: fakestoreapi.com
Пример запроса:

bash
https://fakestoreapi.com/products
*/
