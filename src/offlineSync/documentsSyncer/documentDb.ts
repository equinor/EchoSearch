export function getDocumentKey(document: DocumentSummaryKey): string {
    return document.docNo + document.revNo; //TODO or revStatus? both is used in echopedia..
}

export interface DocumentSummaryKey {
    docNo: string;
    revNo: string;
}

export interface DocumentSummaryDb extends DocumentSummaryKey {
    instCode: string;

    docTitle: string;
    //docClass: string;
    projectCode: string;
    //poNo: string;
    system: string;
    locationCode: string;
    //disciplineCode: string;
    docCategory: string;
    docType: string;
    //contrCode: string;

    revDate?: Date;
    revStatus: string;
    revisionProject: string;
    //keep reasonForIssue: string;
    //keep remark: string;
    tagNoMedia: string;
    insertedDate: Date;
    updatedDate?: Date;
    files: FileDb[];
}

export interface FileDb {
    description: string;
    fileName: string;
    fileOrder: number;
    fileSize: number;
    id: number;
    insertedDate: Date;
    instCode: string;
    //objectType: string;
    prodViewCode: string;
}
