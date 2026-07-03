.PHONY: help install prepare dev dev-firefox build build-firefox \
	zip zip-firefox icons test test-watch typecheck check package clean \
	release-patch release-minor release-major

PNPM ?= pnpm

help: ## Show available commands
	@awk 'BEGIN {FS = ":.*##"; printf "Usage: make <target>\n\nTargets:\n"} \
		/^[a-zA-Z0-9_.-]+:.*##/ {printf "  %-18s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies (pnpm)
	$(PNPM) install

prepare: ## Generate WXT types and prepare the project
	$(PNPM) exec wxt prepare

dev: ## Run Chrome dev server with hot reload
	$(PNPM) dev

dev-firefox: ## Run Firefox dev server with hot reload
	$(PNPM) dev:firefox

build: ## Production build (Chrome)
	$(PNPM) build

build-firefox: ## Production build (Firefox)
	$(PNPM) build:firefox

zip: build ## Build and package Chrome extension zip
	$(PNPM) zip

zip-firefox: build-firefox ## Build and package Firefox extension zip
	$(PNPM) zip:firefox

icons: ## Regenerate extension icons (public/icon/)
	python3 scripts/generate-icons.py

test: ## Run unit tests once
	$(PNPM) test

test-watch: ## Run unit tests in watch mode
	$(PNPM) test:watch

typecheck: ## TypeScript check
	$(PNPM) typecheck

check: typecheck test build ## CI-style check: typecheck, test, build

package: zip zip-firefox ## Build and zip for Chrome and Firefox

clean: ## Remove build output
	rm -rf .output

release-patch: check ## Bump patch version, tag vX.Y.Z, push (triggers GitHub release)
	$(PNPM) version patch -m "Release v%s"
	git push origin HEAD --follow-tags

release-minor: check ## Bump minor version, tag vX.Y.Z, push (triggers GitHub release)
	$(PNPM) version minor -m "Release v%s"
	git push origin HEAD --follow-tags

release-major: check ## Bump major version, tag vX.Y.Z, push (triggers GitHub release)
	$(PNPM) version major -m "Release v%s"
	git push origin HEAD --follow-tags
