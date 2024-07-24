class CustomChart {
	constructor(module, selector, dropdownSelector, config) {
		this.destroy();
		this.ctx = module.querySelector(selector).getContext('2d');
		this.dropdown = module.querySelector(dropdownSelector);
		this.config = config;
		this.chart = new Chart(this.ctx, this.config);
		this.chart.update();
		this.initDropdown();
	}
	destroy() {
		if (this.chart)
			this.chart.destroy();
	}
	updateType(type) {
		this.config.type = type;
		this.destroy();
		this.chart = new Chart(this.ctx, this.config);
	}

	initDropdown() {
		this.dropdown.querySelectorAll('.dropdown-item').forEach(item => {
			item.addEventListener('click', (e) => {
				this.dropdown.querySelectorAll('[data-filter]').forEach(element => element.hidden = false);
				const button = this.dropdown.querySelector('button');
				const filter = e.target.getAttribute('data-filter');
				var elementToHide = this.dropdown.querySelector('[data-filter="' + filter + '"]');
				if (filter === 'Pie Chart' || filter === 'Doughnut Chart')
					delete this.config.options.scales;
				if (filter === 'Pie Chart') {
					this.updateType('pie');
				} else if (filter === 'Bar Chart') {
					this.updateType('bar');
				} else if (filter === 'Doughnut Chart') {
					this.updateType('doughnut');
				}
				button.textContent = filter;
				elementToHide.hidden = true;
			});
		});
	}
}

export { CustomChart };