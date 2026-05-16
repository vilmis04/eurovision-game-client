# Vote For The Winners | Eurovision guessing game

## Deployment
- run command to deploy to image to dockerhub (replace x.x.x with version): docker build -t vsud/ev-game:client-x.x.x . && docker push vsud/ev-game:client-x.x.x
- ssh into the server, update docker compose with the new image version tag: vi ~/PROJECTS/docker-compose.yaml
- run docker compose up -d to start the service with the changes

## Time setting
Time is set in the DB with UTC timezone. So LT time is 3 hours ahead.
