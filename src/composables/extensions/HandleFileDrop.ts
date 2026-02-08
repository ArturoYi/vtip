import type { FileType } from "../utils";
import { Extension, type CommandProps } from '@tiptap/vue-3';

export interface FileDropOptions {
	/**
	 * 当前处理器。默认情况下，它只是将输入原样返回。
	 */
	handler: (files: string) => Promise<string>;
	/**
	 * 本地文件选择器/获取器。默认返回空字符串。
	 * 此函数允许使用者打开本地文件选择器或以其他方式为给定文件类型提供本地文件引用。
	 */
	localFileGetter: (fileType: FileType) => Promise<string | null>;
}

declare module '@tiptap/vue-3' {
	interface Commands<ReturnType> {
		fileDrop: {
			/**
			 * 设置文件处理器，返回上传后的 URL
			 */
			setHandleFileDrop: (handler: (file: string) => Promise<string>) => ReturnType;
			/**
			 * 执行已注册的处理器
			 */
			handleFileDrop: (file: string) => ReturnType;
		};
	}

	interface Storage {
		fileDrop: {
			/**
			 * 处理单个文件并返回 URL
			 */
			handler: (file: string) => Promise<string>;
			/**
			 * 获取指定类型的素材 URL 列表
			 */
			assetsGetter: (fileType: string) => Promise<string[]>;
			/**
			 * 本地选择器/获取器
			 */
			localFileGetter: (fileType: string) => Promise<string | null>;
		};
	}
}

export const FileDrop = Extension.create<FileDropOptions>({
	name: 'fileDrop',

	// 初始化默认处理器
	addOptions() {
		return {
			handler: async (file: string) => file,
			assetsGetter: async () => [],
			localFileGetter: async () => ''
		};
	},

	// 初始化 editor.storage.fileDrop 的默认存储
	addStorage() {
		return {
			handler: this.options.handler,
			localFileGetter: this.options.localFileGetter
		};
	},

	// 注册扩展指令
	addCommands() {
		return {
			setHandleFileDrop:
				(handler) =>
				({ editor }: CommandProps) => {
					// 设置外部处理器
					editor.storage.fileDrop.handler = handler;
					return true;
				},

			handleFileDrop:
				(file) =>
				({ editor }: CommandProps) => {
					// 执行当前注册的处理器
					void editor.storage.fileDrop.handler(file);
					return true;
				}
		};
	}
});
