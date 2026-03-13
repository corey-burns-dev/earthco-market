# Build and push production images from this PC to GHCR
push-images:
	docker build -f Dockerfile.server -t ghcr.io/corey-burns-dev/earthco-market-server:latest .
	docker build -f Dockerfile.client -t ghcr.io/corey-burns-dev/earthco-market-client:latest .
	docker push ghcr.io/corey-burns-dev/earthco-market-server:latest
	docker push ghcr.io/corey-burns-dev/earthco-market-client:latest
