function formatTimeWith(seconds, zeroValue) {
	if(seconds >= 60*60) {
		return (seconds / (60*60)).toFixed(2) + " h";
	} else if(seconds >= 60) {
		return (seconds / 60).toFixed(2) + " m";
	} else if(seconds <= 0) {
		return zeroValue;
	}
	return seconds;
}

export function formatTime(seconds) {
	return formatTimeWith(seconds, "unlimited");
}

export function formatTimeZero(seconds) {
	return formatTimeWith(seconds, "0");
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

export function reformatSettings(settings, formatters) {
	for(const [name, formatter] of Object.entries(formatters)) {
		if(name in settings) {
			settings[name] = formatter(settings[name]);
		}
	}
}

export function formatDateTime(s) {
	if(s?.endsWith("Z")) {
		try {
			const parsed = Date.parse(s);
			if(!Number.isNaN(parsed)) {
				return new Date(parsed).toLocaleString();
			}
		} catch(e)  {
			console.error(`Failed to format datetime '${s}'`, e);
		}
	}
	return s;
}
