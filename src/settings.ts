export interface AgendaLinkerSettings {
	dateFormat: 'YYYY-MM-DD' | 'YYYYMMDD' | 'none';
	replacementChar: string;
	maxFilenameLength: number;
	userName: string;
}

export const DEFAULT_SETTINGS: AgendaLinkerSettings = {
	dateFormat: 'YYYY-MM-DD',
	replacementChar: '-',
	maxFilenameLength: 200,
	userName: 'Shawn'
};
