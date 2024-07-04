.PHONY: $(filter-out help, $(MAKECMDGOALS))

.DEFAULT_GOAL := help

EXT_VERSION=0.0.1
BUILDER_VERSION=0.0.1
DOCKER_BUILD_IMAGE=browserknows:${BUILDER_VERSION}
PACKED_FOLDER=/packed
FF_PACKED=${PACKED_FOLDER}/bk_ff_${EXT_VERSION}.zip
CHROME_PACKED=${PACKED_FOLDER}/bk_chr_${EXT_VERSION}.crx

help:
	@echo "\033[33mUsage:\033[0m\n  make [target] [arg=\"val\"...]\n\n\033[33mTargets:\033[0m"
	@grep -E '^[\.a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[32m%-10s\033[0m %s\n", $$1, $$2}'

build-image: ## Build the Docker images
	docker build . -t ${DOCKER_BUILD_IMAGE} -f ./docker/js/Dockerfile

build: ## Build the bundles
	docker run \
		--volume ${PWD}:/app \
		${DOCKER_BUILD_IMAGE} \
		ash -c "npm install && node esbuild.mjs"

pack: ## Pack the extensions
	docker run \
		--volume ${PWD}/bundle:/bundle \
		--volume ${PWD}/packed:${PACKED_FOLDER} \
		--volume ${PWD}/private.pem:/private.pem \
		--workdir /bundle \
		${DOCKER_BUILD_IMAGE} \
		# Private.pem is from Chrome, but it return an error
		#ash -c "zip -r -FS ${FF_PACKED} ./ && crx3-new /private.pem < ${FF_PACKED} > ${CHROME_PACKED}"
		ash -c "zip -r -FS ${FF_PACKED} ./"
