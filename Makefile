ifeq ($(MAKE_ENV),)
    $(error MAKE_ENV is not specified. It can be 'dev' or 'prod')
endif

SECRETS=config/secrets
MINIFY=node_modules/mjson/index.js

GCLOUD_TEMPLATE=$(SECRETS)/app-$(MAKE_ENV).yaml.template
TEMP_FILE=deploy.yaml

FB_CONFIG_FILE=$(SECRETS)/facebook-$(MAKE_ENV).json
FIREBASE_CONFIG_FILE=$(SECRETS)/halfchess-$(MAKE_ENV)-firebase-adminsdk.json

FB_CONFIG=$(shell $(MINIFY) -s $(FB_CONFIG_FILE) -i '' | sed 's:\\:\\\\:g')
FIREBASE_CONFIG=$(shell $(MINIFY) -s $(FIREBASE_CONFIG_FILE) -i '' | sed 's:\\:\\\\:g')

generate:
	@-sed -e 's~<FB_CONFIG>~$(FB_CONFIG)~g' $(GCLOUD_TEMPLATE) | \
	  sed -e 's~<FIREBASE_CONFIG>~$(FIREBASE_CONFIG)~g' > $(TEMP_FILE)

deploy: generate caution
	@echo Generating and deploy $(TEMP_FILE)
	@gcloud app deploy $(TEMP_FILE)
	@rm $(TEMP_FILE)

help:
	@echo "Command :\n"
	@echo "MAKE_ENV=[dev|prod] make deploy"

caution:
	@echo "\n\n!!!Caution: Please check if you are on the correct gcloud project\n"
	@echo "* Check the target URL"
	@echo "* Check the target Project"
	@echo "\n"

.PHONY: caution help deploy generate
