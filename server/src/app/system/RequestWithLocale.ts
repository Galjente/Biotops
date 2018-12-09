export interface RequestWithLocale {
	locale: any;
	__(key: string): string;
	__p(key: string, ...params: any[]): string;
}
