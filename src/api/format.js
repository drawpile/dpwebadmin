export function formatTime(seconds) {
	if(seconds > 60*60) {
		return (seconds / (60*60)).toFixed(2) + " h";
	} else if(seconds > 60) {
		return (seconds / 60).toFixed(2) + " m";
	} else if(seconds === 0) {
		return "unlimited";
	}
	return seconds;
}

export function formatFileSize(bytes) {
	if(bytes > 1024*1024) {
		return (bytes / (1024*1024)).toFixed(2) + " mb";
	} else if(bytes > 1024) {
		return (bytes / (1024*1024)).toFixed(2) + " kb";
	} else if(bytes === 0) {
		return "unlimited";
	}
	return bytes;
}

export function formatDays(days) {
	if(days === 0)
		return "forever";
	return days + ' days';
}

export function reformatSettings(settings, formatters) {
	for(const [name, formatter] of Object.entries(formatters)) {
		if(name in settings) {
			settings[name] = formatter(settings[name]);
		}
	}
}

