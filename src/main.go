package main

import (
    "context"
    "database/sql"
    "log"
    "sync"

    _ "github.com/go-sql-driver/mysql"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
)

type RecentGame struct {
    Date     int64  `bson:"date"`
    GameType string `bson:"gameType"`
    Mode     string `bson:"mode"`
    Map      string `bson:"map"`
    Ended    *int64 `bson:"ended"` // Use a pointer to handle missing values
}

type Player struct {
    UUID       string       `bson:"uuid"`
    RecentGames []RecentGame `bson:"recentGames"`
}

var (
    mongoURI    = "mongodb://localhost:27017/"
    mongoDBName = "rawgames"
    mongoColl   = "recentgames"
    mysqlDSN    = "yogi:Yogi1234@tcp(localhost:3306)/recentgames"
    maxWorkers  = 1000
    wg          sync.WaitGroup
    docProcessed = 0
    mutex        sync.Mutex
)

func insertData(db *sql.DB, playerUUID string, game RecentGame) {
    // Check if Ended is nil and set a default value if it is
    var ended int64
    if game.Ended != nil {
        ended = *game.Ended
    } else {
        ended = -1 // Use a default value that makes sense in your context
    }

    query := "INSERT INTO recent_games (uuid, date, gameType, mode, map, ended) VALUES (?, ?, ?, ?, ?, ?)"
    _, err := db.Exec(query, playerUUID, game.Date, game.GameType, game.Mode, game.Map, ended)
    if err != nil {
        log.Printf("Error inserting data for player %s: %v", playerUUID, err)
    }
}

func worker(db *sql.DB, jobs <-chan Player, wg *sync.WaitGroup) {
    defer wg.Done()
    for player := range jobs {
        for _, game := range player.RecentGames {
            if game.Ended == nil {
                log.Printf("Player UUID %s has a game without an ended field", player.UUID)
            }
            insertData(db, player.UUID, game)
        }
        mutex.Lock()
        docProcessed++
        if docProcessed%100 == 0 {
            log.Printf("%d documents processed", docProcessed)
        }
        mutex.Unlock()
    }
}

func main() {
    // Set up MongoDB connection
    mongoClient, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(mongoURI))
    if err != nil {
        log.Fatalf("Failed to connect to MongoDB: %v", err)
    }
    defer mongoClient.Disconnect(context.TODO())

    mongoCollection := mongoClient.Database(mongoDBName).Collection(mongoColl)

    // Set up MySQL connection
    db, err := sql.Open("mysql", mysqlDSN)
    if err != nil {
        log.Fatalf("Failed to connect to MySQL: %v", err)
    }
    defer db.Close()

    // Ensure table exists
    _, err = db.Exec(`
        CREATE TABLE IF NOT EXISTS recent_games (
            id INT AUTO_INCREMENT PRIMARY KEY,
            uuid VARCHAR(255),
            date BIGINT,
            gameType VARCHAR(50),
            mode VARCHAR(50),
            map VARCHAR(50),
            ended BIGINT
        )
    `)
    if err != nil {
        log.Fatalf("Failed to create table: %v", err)
    }

    // Set up worker pool
    jobs := make(chan Player, maxWorkers)
    for i := 0; i < maxWorkers; i++ {
        wg.Add(1)
        go worker(db, jobs, &wg)
    }

    // Fetch data from MongoDB and send to workers
    cursor, err := mongoCollection.Find(context.TODO(), bson.M{})
    if err != nil {
        log.Fatalf("Failed to find documents: %v", err)
    }
    defer cursor.Close(context.TODO())

    for cursor.Next(context.TODO()) {
        var player Player
        if err := cursor.Decode(&player); err != nil {
            log.Printf("Error decoding document for player %s: %v", player.UUID, err)
            continue
        }
        jobs <- player
    }
    close(jobs)

    wg.Wait()
    log.Println("Data migration completed.")
}
