/*  jQuery Nice Select - v1.1.0
https://github.com/hernansartorio/jquery-nice-select
Made by Hernán Sartorio  */

(function ($) {

	$.fn.niceSelect = function (method) {

		const defaults = {
			searchable: false
		};

		let options = {};

		// Methods
		if (typeof method == 'string') {
			if (method === 'update') {
				this.each(function () {
					let $select = $(this);
					let $dropdown = $(this).next('.nice-select');
					let open = $dropdown.hasClass('open');

					if ($dropdown.length) {
						$dropdown.remove();
						create_nice_select($select);

						if (open) {
							$select.next().trigger('click');
						}
					}
				});
			} else if (method === 'destroy') {
				this.each(function () {
					let $select = $(this);
					let $dropdown = $(this).next('.nice-select');

					if ($dropdown.length) {
						$dropdown.remove();
						$select.css('display', '');
					}
				});
				if ($('.nice-select').length == 0) {
					$(document).off('.nice_select');
				}
			} else {
				console.log('Method "' + method + '" does not exist.')
			}
			return this;
		}

		// Hide native select
		this.hide();

		// Create custom markup
		this.each(function () {
			let $select = $(this);

			let dataOptions = {
				searchable: $select.data('searchable')
			};

			options = $.extend({}, defaults, dataOptions, typeof method === 'object' ? method : {});

			if (!$select.next().hasClass('nice-select')) {
				create_nice_select($select);
			}
		});

		function create_nice_select($select) {
			$select.after($('<div></div>')
				.addClass('nice-select')
				.addClass($select.attr('class') || '')
				.addClass($select.attr('disabled') ? 'disabled' : '')
				.addClass($select.attr('multiple') ? 'has-multiple' : '')
				.attr('tabindex', $select.attr('disabled') ? null : '0')
				.html(options.searchable
					? $select.attr('multiple') ? '<span class="multiple-options"></span><div class="nice-select-search-box"><input type="text" class="nice-select-search" placeholder="Search..."/></div><ul class="list"></ul>' : '<span class="current"></span><div class="nice-select-search-box"><input type="text" class="nice-select-search" placeholder="Search..."/></div><ul class="list"></ul>'
					: $select.attr('multiple') ? '<ul class="list"></ul>' : '<span class="current"></span><ul class="list"></ul>'
				)
			);

			let $dropdown = $select.next();
			let $options = $select.find('option');
			if ($select.attr('multiple')) {
				let $selected = $select.find('option:selected');
				let $selected_html = '';
				$selected.each(function () {
					$selected_option = $(this);
					$selected_text = $selected_option.data('display') || $selected_option.text();
					$selected_html += '<span class="current">' + $selected_text + '</span>';
				});
				$select_placeholder = $select.data('placeholder') || $select.attr('placeholder');
				$select_placeholder = $select_placeholder == '' ? 'Select' : $select_placeholder;
				$selected_html = $selected_html == '' ? $select_placeholder : $selected_html;
				$dropdown.find('.multiple-options').html($selected_html);
			} else {
				let $selected = $select.find('option:selected');
				$dropdown.find('.current').html($selected.data('display') || $selected.text());
			}


			$options.each(function (i) {
				let $option = $(this);
				let display = $option.data('display');

				$dropdown.find('ul').append($('<li></li>')
					.attr('data-value', $option.val())
					.attr('data-display', (display || null))
					.addClass('option' +
						($option.is(':selected') ? ' selected' : '') +
						($option.is(':disabled') ? ' disabled' : ''))
					.html($option.text())
				);
			});
		}

		/* Event listeners */

		// Unbind existing events in case that the plugin has been initialized before
		$(document).off('.nice_select');

		// Open/close
		$(document).on('click.nice_select', '.nice-select', function (event) {
			let $dropdown = $(this);

			$('.nice-select').not($dropdown).removeClass('open');
			$dropdown.toggleClass('open');

			if ($dropdown.hasClass('open')) {
				$dropdown.find('.option');
				$dropdown.find('.nice-select-search').val('');
				$dropdown.find('.nice-select-search').focus();
				$dropdown.find('.focus').removeClass('focus');
				$dropdown.find('.selected').addClass('focus');
				$dropdown.find('ul li').show();
			} else {
				$dropdown.focus();
			}
		});

		$(document).on('click', '.nice-select-search-box', function (event) {
			event.stopPropagation();
			return false;
		});

		$(document).on('keyup.nice-select-search', '.nice-select', function () {

			if (!options.searchable) {
				return;
			}

			let $self = $(this);
			let $text = $self.find('.nice-select-search').val();
			let $options = $self.find('ul li');

			if ($text == '')
				$options.show();
			else if ($self.hasClass('open')) {
				$text = $text.toLowerCase();
				let $matchReg = new RegExp($text);
				if (0 < $options.length) {
					$options.each(function () {
						let $this = $(this);
						let $optionText = $this.text().toLowerCase();
						let $matchCheck = $matchReg.test($optionText);
						$matchCheck ? $this.show() : $this.hide();
					})
				} else {
					$options.show();
				}
			}
			$self.find('.option'),
				$self.find('.focus').removeClass('focus'),
				$self.find('.selected').addClass('focus');
		})

		// Close when clicking outside
		$(document).on('click.nice_select', function (event) {
			if ($(event.target).closest('.nice-select').length === 0) {
				$('.nice-select').removeClass('open').find('.option');
			}
		});

		// Option click
		$(document).on('click.nice_select', '.nice-select .option:not(.disabled)', function (event) {
			let $option = $(this);
			let $dropdown = $option.closest('.nice-select');
			if ($dropdown.hasClass('has-multiple')) {
				if ($option.hasClass('selected')) {
					$option.removeClass('selected');
				} else {
					$option.addClass('selected');
				}
				$selected_html = '';
				$selected_values = [];
				$dropdown.find('.selected').each(function () {
					$selected_option = $(this);
					let text = $selected_option.data('display') || $selected_option.text()
					$selected_html += '<span class="current">' + text + '</span>';
					$selected_values.push($selected_option.data('value'));
				});
				$select_placeholder = $dropdown.prev('select').data('placeholder') || $dropdown.prev('select').attr('placeholder');
				$select_placeholder = $select_placeholder == '' ? 'Select' : $select_placeholder;
				$selected_html = $selected_html == '' ? $select_placeholder : $selected_html;
				$dropdown.find('.multiple-options').html($selected_html);
				$dropdown.prev('select').val($selected_values).trigger('change');
			} else {
				$dropdown.find('.selected').removeClass('selected');
				$option.addClass('selected');
				let text = $option.data('display') || $option.text();
				$dropdown.find('.current').text(text);
				$dropdown.prev('select').val($option.data('value')).trigger('change');
			}
		});

		// Keyboard events
		$(document).on('keydown.nice_select', '.nice-select', function (event) {
			let $dropdown = $(this);
			let $focused_option = $($dropdown.find('.focus') || $dropdown.find('.list .option.selected'));

			// Enter
			if (event.keyCode == 40) {
				if (!$dropdown.hasClass('open')) {
					$dropdown.trigger('click');
				} else {
					let $next = $focused_option.nextAll('.option:not(.disabled)').first();
					if ($next.length > 0) {
						$dropdown.find('.focus').removeClass('focus');
						$next.addClass('focus');
					}
				}
				return false;
				// Up
			} else if (event.keyCode == 38) {
				if (!$dropdown.hasClass('open')) {
					$dropdown.trigger('click');
				} else {
					let $prev = $focused_option.prevAll('.option:not(.disabled)').first();
					if ($prev.length > 0) {
						$dropdown.find('.focus').removeClass('focus');
						$prev.addClass('focus');
					}
				}
				return false;
				// Esc
			} else if (event.keyCode == 27) {
				if ($dropdown.hasClass('open')) {
					$dropdown.trigger('click');
				}
				// Tab
			} else if (event.keyCode == 9) {
				if ($dropdown.hasClass('open')) {
					return false;
				}
			}
		});

		// Detect CSS pointer-events support, for IE <= 10. From Modernizr.
		let style = document.createElement('a').style;
		style.cssText = 'pointer-events:auto';
		if (style.pointerEvents !== 'auto') {
			$('html').addClass('no-csspointerevents');
		}

		return this;

	};

}(jQuery));