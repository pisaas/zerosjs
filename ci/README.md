# Gitlab Runner Docker
gitlab dev runner

## 运行Gitlab Runner
```bash
docker run -d --name gitlab-runner --restart always \
  -v $HOME/.ssh:/root/.ssh \
  -v $PWD/etc:/etc/gitlab-runner \
  -v $PWD/data:/home/zeros \
  -v /var/run/docker.sock:/var/run/docker.sock \
  gitlab/gitlab-runner:latest

docker run --rm --name gitlab-runner \
-v $HOME/.ssh:/root/.ssh \
-v $PWD/etc:/etc/gitlab-runner \
-v $PWD/data:/home/zeros \
-v /var/run/docker.sock:/var/run/docker.sock \
-ti gitlab/gitlab-runner /bin/sh
# -ti pisaas/gitlab-runner /bin/sh

# 进入docker并注册gitlab-runner
docker exec -ti gitlab-runner /bin/sh

# 注册gitlab-runner
gitlab-runner register \
  --non-interactive \
  --url "https://gitlab.com/" \
  --registration-token "y62fx9r6QFqtUaVm_6Py" \
  --executor "docker" \
  --docker-image "ubuntu:18.04" \
  --description "[rayl-mac] zerosjs" \
  --tag-list "pisaas,zeros,zerosjs,rayl-mac" \
  --run-untagged="true" \
  --locked="false" \
  --access-level="not_protected"

# 验证并删除被移除的runner
gitlab-runner verify --delete

gitlab-runner list
```
