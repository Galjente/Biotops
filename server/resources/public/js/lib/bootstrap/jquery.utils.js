$.views.converters({
    "removeHtmlTags":   function(val) {
        return val.replace(/<.*?>/g, '')
    },
    "upper": function(val) {
        return val.toUpperCase();
    }
});

$.fn.deleteConfirm = function(options) {

    var TITLE_KEY	= 'confirm-title';
    var MESSAGE_KEY	= 'confirm-message';

    var settings = $.extend({
        clickTarget:	undefined,
        defaultTitle:	'Confirm deleting',
        defaultMessage:	'You really want to delete?',
        onConfirm:		function(data){},
        ajaxType:		'DELETE',
        ajaxUrl:		undefined,
        onBeforeSubmit:	function(data){},
        onSuccess:		function(data){},
        onError:		function(data){}
    }, options);

    var jTemplate = $(	'<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="Confirm deleting?" aria-hidden="true">' +
        '<div class="modal-dialog">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
        '<h4 class="modal-title">Confirm deleting</h4>' +
        '</div>' +

        '<div class="modal-body">' +
        '<p class="message"></p>' +
        '</div>' +

        '<div class="modal-footer">' +
        '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
        '<button type="button" class="btn btn-danger delete">Delete</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>'
    );

    var urlTemplate = $.templates(settings.ajaxUrl);

    jTemplate.on('hide.bs.modal', function (event) {
        jTemplate.find('.delete').removeData();
    });

    jTemplate.find('.delete').click(function(){
        var data = $(this).data();
        settings.onConfirm(data);
        if (settings.ajaxUrl) {
            sendDeleteRequest(data);
        }
        jTemplate.modal('hide');
    });

    function showModal(jButton) {
        var title = jButton.data(TITLE_KEY) ? jButton.data(TITLE_KEY) : settings.defaultTitle;
        var message = jButton.data(MESSAGE_KEY) ? jButton.data(MESSAGE_KEY) : settings.defaultMessage;
        jTemplate.find('.modal-title').html(title);
        jTemplate.find('.message').html(message);
        jTemplate.find('.delete').data(jButton.data());
        jTemplate.modal('show');
    }

    function getUrlTemplate(data) {
        return urlTemplate.render(data);
    }

    function sendDeleteRequest(data) {
        var url = getUrlTemplate(data);
        $.ajax({
            type:		settings.ajaxType,
            url:		getUrlWithContext(url),
            beforeSend:	function() {
                settings.onBeforeSubmit(data);
            },
            success:	function(data) {
                settings.onSuccess(data);
            },
            error:		function(data) {
                settings.onError(data);
            }
        });
    }

    if (settings.clickTarget) {
        this.on('click', settings.clickTarget, function(event){
            showModal($(this));
            event.preventDefault();
            return false;
        });
    } else {
        this.click(function() {
            showModal($(this));
        });
    }
};

$.fn.loading = function() {
    var jElement = this;
    var jContainer = $('<div class="spinner-container"></div>');
    var spinner = new Spinner();

    this.show = function() {
        jElement.append(jContainer);
        spinner.spin(jElement[0]);
    };

    this.hide = function() {
        jElement.find('.spinner-container').remove();
        spinner.stop();
    };

    return this;
};

$.fn.alertMessage = function(options) {
    var settings = $.extend({
        defaultMessage: '',
        defaultType:    'info'
    }, options);


    var DEFAULT_TYPE = 'error';
    var TYPES = {
        'info': 'alert-success',
        'warning': 'alert-warning',
        'error': 'alert-danger'
    };
    var jElement = this;

    var currentType;

    jElement.hide();

    function getCssClass(type) {
        var cssClass = TYPES[type];
        if (!cssClass) {
            cssClass = TYPES[DEFAULT_TYPE];
        }
        return cssClass;
    }

    this.showMessage = function(messageOptions) {
        function processObjectWithMessages(messages) {
            var message = '';
            for (var key in messages) {
                var messageFromMessages = messages[key];
                if (Array.isArray(messageFromMessages)) {
                    message += (message.length ? '<br/>' : '') + processArrayWithMessages(messageFromMessages);
                } else if (typeof messageFromMessages == 'object') {
                    message += (message.length ? '<br/>' : '') + processObjectWithMessages(messageFromMessages);
                } else if (messageFromMessages) {
                    message += (message.length ? '<br/>' : '') + messageFromMessages;
                }
            }
            return message;
        }

        function processArrayWithMessages(messages) {
            var message = '';
            for (var i = 0; i < messages.length; i++) {
                var messageFromMessages = messages[i];
                if (Array.isArray(messageFromMessages)) {
                    message += (message.length ? '<br/>' : '') + processArrayWithMessages(messageFromMessages);
                } else if (typeof messageFromMessages == 'object') {
                    message += (message.length ? '<br/>' : '') + processObjectWithMessages(messageFromMessages);
                } else if (messageFromMessages) {
                    message += (message.length ? '<br/>' : '') + messageFromMessages;
                }
            }
            return message;
        }
        if (typeof messageOptions == 'string') {
            messageOptions = {
                message:	messageOptions
            };
        } else if (Array.isArray(messageOptions)) {
            messageOptions = {
                message:	processArrayWithMessages(messageOptions)
            };
        }
        var messageSettings = $.extend({
            message:    settings.defaultMessage,
            type:       settings.defaultType
        }, messageOptions);

        currentType = getCssClass(messageSettings.type);
        jElement.addClass(currentType);
        jElement.html(messageSettings.message);
        jElement.show();
    }

    this.hideMessage = function() {
        jElement.hide();
        jElement.removeClass(currentType);
    }

    return this;
};

$.emptyPagination = function () {
    this.getCurrentPage = function() {
        return 0;
    };

    this.isNeedToRemovePreviousLoad = function() {
        return false;
    };

    this.setPagingData = function (page, totalPages) {};
    this.onChange = function (callback) {};
    return this;
};

$.fn.buttonPagination = function(options) {
	var settings = $.extend({
		currentPage:    1,
		totalPages:      0
	}, options);

	var jPagination = this;
	var pageChangeCallback;

	var initPagination = function() {
		jPagination.bootpag({
			page:       settings.currentPage,
			total:      settings.totalPages,
			maxVisible: settings.totalPages
		})
	};

	this.getCurrentPage = function() {
		return settings.currentPage;
	};

    this.isNeedToRemovePreviousLoad = function() {
        return true;
    };

	this.setPagingData = function (page, totalPages) {
		settings.currentPage = page;
		settings.totalPages = totalPages;
		initPagination();
	};

	this.onChange = function (callback) {
		pageChangeCallback = callback;
	};

	initPagination();
	jPagination.on('page', function(event, num){
		settings.currentPage = num;
        pageChangeCallback(num, settings.totalPages);
	});

	return this;
};

$.fn.scrollPagination = function(options) {
	var settings = $.extend({
	    jScrollWindow:          undefined,
        jScrollingSector:       this.parent(),
        scrollPositionOffset:   0,
        currentPage:            1,
        totalPages:             0
    }, options);

	var jLoading = this;
    var jSpinner = jLoading.find('.spinner');

    var spinner = new Spinner();
	var pageChangeCallback;
	var pageLoading = true;

    spinner.spin(jSpinner[0]);

	this.getCurrentPage = function() {
		return settings.currentPage;
	};

	this.isNeedToRemovePreviousLoad = function() {
	    return false;
    };

	this.setPagingData = function (page, totalPages) {
        settings.currentPage = page;
        settings.totalPages = totalPages;

        if (settings.currentPage >= settings.totalPages) {
            jLoading.hide();
        }
        pageLoading = false;
	};

	this.onChange = function (callback) {
		pageChangeCallback = callback;
	};

	settings.jScrollWindow.scroll(function() {
	    if (!pageLoading && settings.currentPage < settings.totalPages) {
	        var loaderTopPosition = jLoading.position().top;
            var windowPosition = settings.jScrollWindow.scrollTop() + settings.jScrollWindow.height();

            if (windowPosition >= loaderTopPosition) {
                pageLoading = true;
                pageChangeCallback(settings.currentPage + 1, settings.totalPages);
            }
        }
    });



	return this;
};

$.fn.list = function(options) {
    var settings = $.extend({
        dataTemplateSelector:		'',
        ajaxType:					'GET',
        ajaxUrl:					'',
        jSearchArea:                undefined,
	    jLoading:                   undefined,
	    jMessage:                   undefined,
	    jPagination:                undefined,
        preload:                    true,
        beforeAppend:			    function(jTemplate, data) {},
        afterAppend:			    function(jTemplate, data) {},
        onUrlRender:				function(jList) {}
    }, options);

    if (!settings.jPagination) {
    	throw 'jPagination parameter is required';
    }

    var jList = this;

	var urlTemplate = $.templates(settings.ajaxUrl);
	var dataTemplate = $.templates(settings.dataTemplateSelector);

	function applyDateFormatting(jTemplate) {
        jTemplate.find('.date').each(function() {
            var jElement = $(this);
            var dateTimeFormat = jElement.data('date-format');
            var epochTime = jElement.html();
            if (epochTime && dateTimeFormat) {
                if (moment(epochTime).isValid()) {
                    var time = moment(epochTime);
                    jElement.html(time.format(dateTimeFormat));
                } else if (!isNaN(parseInt(epochTime))) {
                    var time = moment.unix(epochTime);
                    jElement.html(time.format(dateTimeFormat));
                }
            }
        });
    }

    function addData(data) {
        var jTemplate = '';
        if (data && data.length > 0) {
            jTemplate = $(dataTemplate.render(data));
            settings.beforeAppend(jTemplate, data);
            applyDateFormatting(jTemplate);
	        jList.append(jTemplate);
	        settings.afterAppend(jTemplate, data);
        }
    }

	function getUrlTemplate(page) {
		var data = {page: page};
		data = $.extend(data, jList.data());
		data = $.extend(data, settings.onUrlRender(jList));
		return urlTemplate.render(data);
	}

	function getSearchData() {
	    var searchData = {}
	    if (settings.jSearchArea && settings.jSearchArea.length) {
            settings.jSearchArea.find('[name]').each(function(index, element) {
                var jElement = $(element);
	            searchData[jElement.attr('name')] = jElement.val();
            });
        }

        return searchData;
    }

	function loadPage(page) {
    	if (settings.jLoading) {
		    settings.jLoading.show();
	    }
		var url = getUrlTemplate(page -1);
		if (settings.jMessage) {
			settings.jMessage.hideMessage();
		}

		if (settings.jPagination.isNeedToRemovePreviousLoad()) {
            jList.empty();
        }

		$.ajax({
			type:       settings.ajaxType,
			url:        getUrlWithContext(url),
            data:       getSearchData(),
		}).done(function(data, textStatus, jqXHR) {
			try {
				addData(data.content);
			} catch (e) {
				if (settings.jMessage) {
					settings.jMessage.showMessage("Can't parse content");
				}
			}
			if (settings.jLoading) {
				settings.jLoading.hide();
			}
			if (data.totalPages > 0 && page > data.totalPages) {
				loadPage(data.totalPages);
			} else {
				if (settings.jPagination) {
					settings.jPagination.setPagingData(page, data.totalPages);
				}
			}
		}).fail(function(jqXHR, textStatus, errorThrown) {
			if (settings.jMessage) {
				var errorMessage = '';
				if (jqXHR.status == 404){
					errorMessage = jqXHR.status + ' ' + jqXHR.statusText;
				} else {
					errorMessage = 'Unknown error, please try again later :(';
				}
				settings.jMessage.showMessage(errorMessage);
			}
			if (settings.jLoading) {
				settings.jLoading.hide();
			}
		});
	}

	function refreshPage() {
		loadPage(settings.jPagination.getCurrentPage());
	}

	this.refresh = function() {
		refreshPage();
	};

	if (settings.jPagination) {
		settings.jPagination.onChange(function(page, totalPage) {
			loadPage(page);
		});
	}

	jList.on('list.refresh', function(event, data) {
		refreshPage();
	});

	if (settings.preload) {
        refreshPage();
    }

    return this;
};

/**
 * Helper for dynamic table content drawing with paging
 * @param options.dataTemplateSelector - jQuery selector to JSRender template for representing table content
 * @param options.paginationSelector (default: .pagination) - jQuery selector for pagination container (need to be inside of the table)
 * @param options.listSelector (default: tbody) - jQuery selector for representing content (need to be inside of the table)
 * @param options.errorSelector (default: .alert) - jQuery selector for representing errors while fetching data from server (need to be near the table)
 *
 * @returns {$}
 */
$.fn.tableList = function(options) {
    var settings = $.extend({
        dataTemplateSelector:		'',
        paginationSelector:			'.pagination',
        searchAreaSelector:         undefined,
        listSelector:				'tbody',
        errorSelector:				'.alert',
        currentPage:				1,
        ajaxType:					'GET',
        ajaxUrl:					'',
	    jLoading:                   this.loading(),
        preload:                    true,
        beforeAppend:				function(jTemplate, data){},
        onUrlRender:				function(jTable){}
    }, options);

    var jTable = this;
	var jError = jTable.siblings(settings.errorSelector);
	var jMessage = jError.length ? jError.alertMessage({defaultType: 'error'}) : {};
    var jSearchArea = settings.searchAreaSelector ? jTable.find(settings.searchAreaSelector) : {};
    var jPaginationSelector = jTable.find(settings.paginationSelector);
    var jPagination = jPaginationSelector.length ? jPaginationSelector.buttonPagination({currentPage:    settings.currentPage}) : $.emptyPagination();
	var jList = jTable.find(settings.listSelector).list({
		dataTemplateSelector:       settings.dataTemplateSelector,
		ajaxType:                   settings.ajaxType,
		ajaxUrl:                    settings.ajaxUrl,
        jSearchArea:                jSearchArea,
		jPagination:                jPagination,
		jLoading:                   settings.jLoading,
		jMessage:                   jMessage,
        preload:                    settings.preload,
		beforeAppend:               function(jTemplate, data) {
			settings.beforeAppend(jTemplate, data);
		},
		onUrlRender:                function(jList) {
			return $.extend(jTable.data(), settings.onUrlRender(jTable));
		}
	});

    this.refresh = function() {
	    jList.refresh();
    };

    this.loading = function() {
        return settings.jLoading;
    };

    this.message = function() {
        return jMessage;
    };

    return this;
};

$.fn.delayedCheck = function(options) {
    var settings = $.extend({
        timeout:		500,
        before:			function(){},
        submit:			function(){},
        success:		function(){},
        error:			function(){},
        startTyping:	function(){},
        stopTyping:		function(){},
        ajaxType:		'GET',
        ajaxUrl:		''
    }, options);

    var jElement = this;
    var typing = false;
    var urlTemplate = $.templates(settings.ajaxUrl);
    var timePointer;

    this.checkData = function(success, error) {
        $.ajax({
            type:		settings.ajaxType,
            url:		getUrlWithContext(urlTemplate.render({value: jElement.val()})),
            success:	function(data) {
                if (!data || data == "") {
                    error(jElement, data);
                } else {
                    success(jElement, data);
                }
            },
            error:		function(data) {
                error(jElement, data);
            }
        });
    };

    this.submit = function() {
        jElement.checkData(settings.submit, settings.error);
    }

    function onTimeout() {
        if (typing && jElement.val().length > 0) {
            settings.before(jElement);
            jElement.checkData(settings.success, settings.error);
        }

        settings.stopTyping(jElement);
        typing = false;
    }

    jElement.keyup(function(e){
        clearTimeout(timePointer);
        if (!typing) {
            settings.startTyping(jElement);
            typing = true;
        }
        if (e.which == 13) {
            jElement.checkData(settings.submit, settings.error);
            settings.stopTyping(jElement);
            typing = false;
        } else {
            timePointer = setTimeout(onTimeout, settings.timeout);
        }
    });

    return this;
};

$.fn.pageForm = function(options) {
    var settings = $.extend({
        onBeforeSubmit:	function(arr, form, options){},
        onFormLoaded:	function(jForm, data){},
        onSuccess:		function(jForm, data){},
        onError:		function(jForm, data){},
	    onUrlRender:	function(jForm){},
        loadFormUrl:	'',
        loadForm:		false,
        jLoading:		this.loading(),
        jSubmitButton:	this.find('.buttons .save'),
        jCancelButton:	this.find('.buttons .cancel'),
        errorCodeMessage:   {}
    }, options);
    settings.errorCodeMessage = $.extend({
        400:        'Incorrect input parameters.',
        403:        'Access is denied',
        404:        'Sorry, data not found.',
        500:        'Something goes wrong, please try again later.',
        'other':    'Unknown error, please try again later! :('
    }, settings.errorCodeMessage);

    var jForm = this;
    var jMessage = jForm.find('div[class="alert"]').alertMessage({defaultType: 'error'});
	var urlTemplate = $.templates(settings.loadFormUrl);

	function getUrlTemplate(id) {
		var data = {id: id};
		data = $.extend(data, jForm.data());
		data = $.extend(data, settings.onUrlRender(jForm));
		return urlTemplate.render(data);
	}

    jForm.ajaxForm({
        beforeSubmit:	function(arr, form, options) {
	        settings.jLoading.show();
	        jMessage.hideMessage();
	        jForm.resetFieldErrors();
            settings.onBeforeSubmit(arr, form, options);
        },
        success:		function(data) {
            if (data.errors && data.errors.length > 0) {
                jMessage.showMessage(data.errors);
            } else {
                jForm.fillForm(data);
                settings.onSuccess(jForm, data);
            }
            settings.jLoading.hide();
        },
        error:			function(data) {
            var jsonData = data.responseJSON;
            if (data.status == 400 && jsonData) {
				jForm.setFieldErrors(jsonData);
				var errorMessage = [];
				for (var key in jsonData) {
                    errorMessage.push(jsonData[key]);
                }
				if (errorMessage.length) {
                    jMessage.showMessage(errorMessage);
                }
            } else if (jsonData && jsonData.errors && jsonData.errors.length > 0) {
                jMessage.showMessage(jsonData.errors);
            } else {
                var message = settings.errorCodeMessage[data.status];
                if (!message) {
                    message = settings.errorCodeMessage['other'];
                }
                jMessage.showMessage(message);
            }
            settings.onError(jForm, data);
            settings.jLoading.hide();
        }
    });

    settings.jSubmitButton.click(function(event) {
        jForm.submit();
    });

    if (settings.jCancelButton) {
        settings.jCancelButton.click(function(event) {
            jForm.loadForm();
        });
    }

    this.loadForm = function(id) {
    	var url = getUrlTemplate(id);
    	if (url) {
		    settings.jLoading.show();
		    $.ajax({
			    type: 'GET',
			    url: getUrlWithContext(url),
			    success: function (data) {
				    if (data.errors && data.errors.length > 0) {
					    jMessage.showMessage(data.errors);
				    } else {
					    jForm.fillForm(data);
					    settings.onFormLoaded(jForm, data);
				    }
				    settings.jLoading.hide();
			    },
			    error: function (data) {
				    var jsonData = data.responseJSON;
				    if (jsonData && jsonData.errors && jsonData.errors.length > 0) {
					    jMessage.showMessage(jsonData.errors);
				    } else {
					    jMessage.showMessage('Can\'t get form data :(');
				    }
				    settings.jLoading.hide();
			    }
		    });
	    }
    };

    this.loading = function() {
        return settings.jLoading;
    };

    this.form = function() {
        return jForm;
    };

    this.message = function() {
        return jMessage;
    };

    this.reset = function() {
        jForm.clearForm();
        jForm.find('input[name="id"]').val('');
        jForm.find('input[type="hidden"]').val('');
        jForm.find('.checkbox-switch').bootstrapSwitch('state', false);
        jForm.find('select').each(function (index, element) {
            var jElement = $(element);
            jElement.val(jElement.find('option').first().val());
        });
        jForm.resetFieldErrors();
    };

    if (settings.loadForm) {
        this.loadForm();
    }

    return this;
};

$.fn.modalForm = function(options) {

    var settings = $.extend({
        onModalHidden:	function(jModal){},
        onModalShow:	function(jElement, jModal){},
        onBeforeSubmit:	function(arr, form, options){},
        onSuccess:		function(jModal, data){},
        onError:		function(jModal, data){},
	    onUrlRender:	function(jModal){},
        onFormLoaded:	function(jModal, data){},
	    loadFormUrl:	'',
        jCancelButton:	undefined,
        jModalTitle:    this.find('.modal-title'),
    }, options);


    var jModal = this;
    var jForm = this.find('form').pageForm({
        onBeforeSubmit:	settings.onBeforeSubmit,
        onSuccess:		function(jForm, data){
            settings.onSuccess(jModal, data);
        },
        onError:		function(jForm, data){
            settings.onError(jModal, data);
        },
	    onUrlRender:    function(jForm) {
        	return settings.onUrlRender(jModal);
	    },
        onFormLoaded:	function(jForm, data){
            settings.onFormLoaded(jModal, data);
        },
	    loadFormUrl:    settings.loadFormUrl,
        jLoading:       jModal.find('.modal-content').loading(),
        jSubmitButton:  jModal.find('.modal-footer button[type="submit"]'),
        jCancelButton:  settings.jCancelButton
    });

    jModal.modal({
        backdrop:   'static',
        show:       false
    });

    jModal.on('hidden.bs.modal', function (event) {
        jForm.form().reset();
        if (settings.jModalTitle && settings.jModalTitle.data('default-text')) {
            changeTitle(settings.jModalTitle.data('default-text'));
        }
        jForm.message().hideMessage();
        settings.onModalHidden(jModal);
    });

    jModal.on('show.bs.modal', function (event) {
        var jElement = $(event.relatedTarget);
        var id = jElement.data("id");
        if (id) {
            jForm.data('new', false);
            jForm.loadForm(id);
        } else {
            jForm.data('new', true);
        }
        settings.onModalShow(jElement, jModal);
    });

    var changeTitle = function(title) {
        if (settings.jModalTitle && title) {
            settings.jModalTitle.html(title);
        }
        return settings.jModalTitle;
    };

    this.title = function(titleText) {
        return changeTitle(titleText);
    };

    this.loading = function(command) {
        switch(command) {
            case 'show':
                jForm.loading().show();
            break;

            case 'hide':
                jForm.loading().hide();
            break;

            case 'instance':
            default:
                return jForm.loading();
        }
    };

    this.form = function() {
        return jForm.form();
    };

    this.message = function() {
        return jForm.message();
    };

    return this;
};

$.fn.resetFieldErrors = function() {
	var jForm = this;

	jForm.find('.has-error').removeClass('has-error');
};

$.fn.setFieldErrors = function(data) {
    var bracketApproach = typeof(enableBracket) === "undefined" ? false : enableBracket;
	var jForm = this;

    bracketApproach ? processAsBracket(data) : processAsDot(data);

    function processAsDot(data, parentKey) {
        if (!parentKey) {
            parentKey = '';
        }

        for (var key in data) {
            if (typeof data[key] === 'object') {
                processAsDot(data[key], parentKey + (parentKey ? '.' : '') + key)
            } else {
                var jInput = jForm.find('[name="' + parentKey + (parentKey ? '.' : '') + key + '"]');
                setError(jInput);
            }
        }
    }

    function processAsBracket(data, parentKey) {
        if (!parentKey) {
            parentKey = '';
        }

        for (var key in data) {
            if (typeof data[key] === 'object') {
                processAsBracket(data[key], parentKey + (parentKey ? '[' : '') + key + (parentKey ? ']' : ''))
            } else {
                var jInput = jForm.find('[name="' + parentKey + (parentKey ? '[' : '') + key + (parentKey ? ']' : '') + '"]');
                setError(jInput);
            }
        }
    }

    function setError(jElement) {
        var jFormGroup = jElement.parent();
        if (!jFormGroup.hasClass('has-error')) {
            jFormGroup.addClass('has-error');
        }
    }
};

$.fn.fillForm = function(data) {
    var bracketApproach = typeof(enableBracket) === "undefined" ? false : enableBracket;
    var jForm = this;

    bracketApproach ? processAsBracket(data) : processAsDot(data);

    function processAsDot(data, parentKey) {
        if (!parentKey) {
            parentKey = '';
        }

        for (var key in data) {
            if (typeof data[key] === 'object') {
                processAsDot(data[key], parentKey + (parentKey ? '.' : '') + key)
            } else {
                var jInput = jForm.find('[name="' + parentKey + (parentKey ? '.' : '') + key + '"]');
                setValue(jInput, data[key]);
            }
        }
    }

    function processAsBracket(data, parentKey) {
        if (!parentKey) {
            parentKey = '';
        }

        for (var key in data) {
            if (typeof data[key] === 'object') {
                processAsBracket(data[key], parentKey + (parentKey ? '[' : '') + key + (parentKey ? ']' : ''))
            } else {
                var jInput = jForm.find('[name="' + parentKey + (parentKey ? '[' : '') + key + (parentKey ? ']' : '') + '"]');
                setValue(jInput, data[key]);
            }
        }
    }

    function setValue(jElement, value) {
        if (jElement.hasClass('checkbox-switch')) {
            jElement.bootstrapSwitch('state', value, true);
        } else if (jElement.hasClass('input-date')) {
            jElement.val($.format.date(value, 'yyyy-MM-dd'));
        } else {
            jElement.val(value);
        }
    }
};
