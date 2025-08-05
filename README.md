# FileScout
Spring Boot + React app for super‑quick local file management:
* load files from any directory
* create / append / delete files
* zap duplicate files by content
* keyword search across files
* multithreaded “top‑10 words” analysis (pick your thread count)

**Live UI:** https://filescoutfrontend.netlify.app
---
**Backend status:** deployment in progress
---

## Core Features
| Feature               | What it does                                                     |
|-----------------------|------------------------------------------------------------------|
| **Load Files**        | Scan a directory and return each file’s word & character counts. |
| **Create File**       | Make a brand‑new text file with initial content.                 |
| **Write File**        | Append text to an existing file.                                 |
| **Delete File**       | Remove a chosen file.                                            |
| **Delete Duplicates** | Detect duplicate content and delete the copies.                  |
| **Keyword Search**    | List every file that contains a given keyword.                   |
| **Top 10 Words**      | Multithreaded count of the ten most frequent words in a file.    |

---

## 🔗 REST API (Base URL `/api`)
> All endpoints return JSON.  
> Query params are sent as standard URL search params.

| Verb | Path | Required Params           | Purpose |
|------|------|---------------------------|---------|
| **GET** | `/files/loadFiles` | `directoryPath`           | Load all files in directory. |
| **POST** | `/files/createFile` | `fileName`, `fileContent` | Create new file. |
| **POST** | `/files/writeFile` | `fileName`, `fileContent` | Append to file. |
| **DELETE** | `/files/deleteFile` | `fileName`                | Delete specified file. |
| **DELETE** | `/files/deleteDuplicates` | –                         | Delete duplicate files by content. |
| **GET** | `/files/keywordSearch` | `keyword`                 | Search files by keyword. |
| **GET** | `/files/countWords` | `fileName`, `numThreads`  | Return top‑10 word counts (multi‑threaded). |

## Monitoring (Prometheus + Grafana)

1. **Expose metrics**  
   *In `pom.xml`:*
   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-actuator</artifactId>
   </dependency>
   <dependency>
       <groupId>io.micrometer</groupId>
       <artifactId>micrometer-registry-prometheus</artifactId>
   </dependency>
   ```
    *In `application.yml`:*
    ```yaml
       management.endpoints.web.exposure.include=*
        management.metrics.export.prometheus.enabled=true
    ```
2. **Run Prometheus**
    
    Create a minimal `prometheus.yml` alongside prometheus.exe:
    
    ```yaml
    global:
      scrape_interval: 5s
    scrape_configs:
      - job_name: "filescout"
        metrics_path: "/actuator/prometheus"
        static_configs:
          - targets: ["localhost:8080"]
    ```

3. **Import a dashboard**
- Enter ID 10280 (Spring Boot 2 Stats) → Load
- Select your Prometheus data source → Import

4. **JVM metrics, HTTP latencies, GC stats, and custom meters will appear in Grafana.**
![img.png](img.png)
