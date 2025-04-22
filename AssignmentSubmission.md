# Enhancing Mattermost Open Source: High Availability and Horizontal Scalability

## **Overview**
This project enhances the open-source Mattermost application to support high availability (HA) and horizontal scalability. The modifications ensure seamless multi-server deployment, consistent message history, and real-time synchronization across servers.

---

## **Architecture Design**

### **1. Multi-Server Deployment**
- **Load Balancer**:
  - NGINX is configured as a reverse proxy to distribute traffic across multiple Mattermost servers.
  - The `default.conf` file includes an `upstream` block for load balancing:
    ```properties
    upstream app_cluster {
      server leader:8065 fail_timeout=10s max_fails=10;
      server follower:8065 fail_timeout=10s max_fails=10;
      server follower2:8065 fail_timeout=10s max_fails=10;
    }
    ```

- **Cluster Settings**:
  - The `config.json` file enables clustering:
    ```json
    "ClusterSettings": {
      "Enable": true,
      "ClusterName": "mm_dev_cluster",
      "GossipPort": 8074
    }
    ```

### **2. Consistent Message History**
- **Database**:
  - All servers connect to a shared database (PostgreSQL or MySQL) to ensure consistent data storage.
  - Example configuration in `docker-compose.common.yml`:
    ```yml
    postgres:
      image: "postgres:13"
      environment:
        POSTGRES_USER: mmuser
        POSTGRES_PASSWORD: mostest
        POSTGRES_DB: mattermost_test
    ```

- **Shared File Storage**:
  - File uploads are stored in a shared MinIO instance:
    ```yml
    minio:
      image: "minio/minio:RELEASE.2024-06-22T05-26-45Z"
      command: "server /data --console-address :9002"
    ```

### **3. Real-Time Synchronization**
- **Redis**:
  - Redis is used for caching and Pub/Sub to synchronize events like user presence and typing indicators.
  - Example `CacheSettings` in `config.json`:
    ```json
    "CacheSettings": {
      "CacheType": "redis",
      "RedisAddress": "redis:6379",
      "RedisDB": 0
    }
    ```

- **WebSocket Handling**:
  - WebSocket connections are proxied through NGINX:
    ```properties
    location ~ /api/v[0-9]+/(users/)?websocket$ {
      proxy_pass http://app_cluster;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }
    ```

---

## **Deployment Steps**
1. **Set Up Servers**:
   - Deploy multiple Mattermost servers with identical `config.json` files.
   - Ensure all servers connect to the same database and file storage.

2. **Configure NGINX**:
   - Update the `default.conf` file to include all servers in the `upstream` block.
   - Reload NGINX:
     ```bash
     sudo nginx -t
     sudo systemctl reload nginx
     ```

3. **Enable Clustering**:
   - Set `"Enable": true` in the `ClusterSettings` section of `config.json`.

4. **Verify Setup**:
   - Check the cluster status in the Mattermost System Console under **Environment > High Availability**.

---

## **Testing and Validation**
- **Logs**:
  - Monitor NGINX logs:
    ```bash
    sudo tail -f /var/log/nginx/access.log
    ```
  - Monitor Mattermost logs:
    ```bash
    tail -f /opt/mattermost/logs/mattermost.log
    ```

- **Cluster Status**:
  - Verify that all servers are listed with green status indicators in the System Console.

- **Load Testing**:
  - Use tools like Apache JMeter or Locust to simulate high traffic and ensure the system scales horizontally.

---

## **Conclusion**
This project successfully enhances the Mattermost open-source application to support high availability and horizontal scalability. The modifications ensure seamless communication, consistent data, and real-time synchronization across multiple servers.
