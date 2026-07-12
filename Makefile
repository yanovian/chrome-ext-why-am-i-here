.PHONY: help install prepare dev dev-firefox build build-firefox \
	zip zip-firefox icons test test-watch typecheck check package clean \
	website-install website-dev website-build website-preview website-clean \
	website-lint-i18n website-lint-i18n-fix website-og-images \
	release-patch release-minor release-major

PNPM ?= pnpm
WEBSITE ?= website
# Shortest GitHub Pages path for yanovian/chrome-ext-why-am-i-here (repo name, no extra folder).
GITHUB_PAGES_BASE ?= /chrome-ext-why-am-i-here/

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

website-install: ## Install marketing site dependencies (website/)
	cd $(WEBSITE) && $(PNPM) install

website-dev: ## Marketing site dev server (localhost, hot reload, base /)
	cd $(WEBSITE) && $(PNPM) dev

website-build: ## Production build for GitHub Pages (base $(GITHUB_PAGES_BASE))
	cd $(WEBSITE) && VITE_BASE_PATH=$(GITHUB_PAGES_BASE) $(PNPM) build

website-preview: website-build ## Preview production build at http://localhost:4173$(GITHUB_PAGES_BASE)
	cd $(WEBSITE) && $(PNPM) exec vite preview --host --base $(GITHUB_PAGES_BASE)

website-clean: ## Remove marketing site dist and copied public assets
	rm -rf $(WEBSITE)/dist $(WEBSITE)/public

website-lint-i18n: ## Check website locale JSON keys match en (no missing, no extra)
	cd $(WEBSITE) && $(PNPM) lint-i18n

website-lint-i18n-fix: ## Add missing locale keys as "" (warns per locale/key)
	cd $(WEBSITE) && $(PNPM) lint-i18n-fix

website-og-images: ## Regenerate committed OG share images (static/og/*.png)
	cd $(WEBSITE) && $(PNPM) og-images

release-patch: check ## Bump patch version, tag vX.Y.Z, push (triggers GitHub release)
	$(PNPM) version patch -m "Release v%s"
	git push origin HEAD --follow-tags

release-minor: check ## Bump minor version, tag vX.Y.Z, push (triggers GitHub release)
	$(PNPM) version minor -m "Release v%s"
	git push origin HEAD --follow-tags

release-major: check ## Bump major version, tag vX.Y.Z, push (triggers GitHub release)
	$(PNPM) version major -m "Release v%s"
	git push origin HEAD --follow-tags
