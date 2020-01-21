# trap-ghost-objectstorage-migrate

optimizes images and then upload files to openstack swift

1. place files to ./data

2. create config.json

```json
{
  "username": "",
  "password": "",
  "authUrl": "",
  "region": "",
  "tenantId": "",
  "container": ""
}
```

3. run command

```sh
$ node index.js opt # optimize images
$ node index.js upload # upload files
```
