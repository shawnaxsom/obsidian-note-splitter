export interface NoteSplitterSettings {
	dateFormat: 'YYYY-MM-DD' | 'YYYYMMDD' | 'none';
	replacementChar: string;
	maxFilenameLength: number;
	userName: string;
}

export const DEFAULT_SETTINGS: NoteSplitterSettings = {
	dateFormat: 'YYYY-MM-DD',
	replacementChar: '-',
	maxFilenameLength: 200,
	userName: 'Shawn'
};
