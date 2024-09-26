import { ModelApp } from '../models';

export default function getApp(appList: Array<ModelApp>, appId: string): ModelApp | undefined {
    return appList.find(app => app._id === appId);
}