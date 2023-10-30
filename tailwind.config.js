module.exports = {
	content: [
		'./src/**/*.{tsx,ts,jsx,js,html}',
		//  './../node_modules/@unlock-protocol/ui/dist/*.{js,css}'
	],
	presets: [require('./packages/ui/public/unlock-tailwind-preset')],
};
