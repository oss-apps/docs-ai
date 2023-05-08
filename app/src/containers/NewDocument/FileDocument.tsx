/* eslint-disable @typescript-eslint/no-unsafe-return */
import { type Org, type Project } from "@prisma/client"
import { useState, type ChangeEventHandler } from "react";
import PrimaryButton from "~/components/form/button"
import { api } from "~/utils/api";
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { toast } from "react-hot-toast";
import { getLimits } from "~/utils/license";
import { useRouter } from "next/router";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;


const readTxtFile = (file: File): Promise<{ data: string, fileName: string, size: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      data: reader.result as string,
      fileName: file.name,
      size: new Blob([reader.result as string]).size
    });
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

const readPdfFile = async (file: File) => {
  const fileUrl = URL.createObjectURL(file);
  const pdf = await pdfjsLib.getDocument(fileUrl).promise;
  const totalPages = pdf.numPages;
  const pagesPromise: Promise<string>[] = []

  const getPageText = async (pageNumber: number) => {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items.map((item) => {
      if (item?.str) {
        return item.str;
      }
      return ''
    }).join(' ')

    return text;
  }

  for (let i = 1; i <= totalPages; i++) {
    pagesPromise.push(getPageText(i))
  }

  const pagesText = (await Promise.all(pagesPromise)).join('\n')
  const size = new Blob([pagesText]).size;

  return { data: pagesText, fileName: file.name, size };
}

const readDocxFile = async (file: File) => {
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  const text = result.value.replace(/<[^>]*>?/gm, '');
  const size = new Blob([text]).size;

  return { data: text, fileName: file.name, size };
}


export const FileDocument: React.FC<{ org: Org, project: Project, document?: Document }> = ({ project, org, document }) => {
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<Array<{ data: string, fileName: string, size: number }>>([])
  const [size, setSize] = useState(0);
  const [error, setError] = useState<string | null>(null)

  const createUploadFileUrls = api.document.createUploadFileUrls.useMutation()
  const indexFileDocument = api.document.indexFileDocument.useMutation()

  const router = useRouter()

  const uploadToClient: ChangeEventHandler<HTMLInputElement> = async (event) => {
    const fileData: Promise<{ data: string, fileName: string, size: number }>[] = []
    if (event.target.files?.length) {
      for (let i = 0; i < event.target.files?.length || 0; i++) {
        if ((event.target.files.item(i)?.size || 0) > 5e+7) {
          setError('File size should be less than 50MB')
          return
        }
        if (event.target.files.item(i)?.type === 'text/plain') {
          if (event.target.files.item(i)) {
            fileData.push(readTxtFile(event.target.files.item(i) as File))
          }
        } else if (event.target.files.item(i)?.type === 'application/pdf') {
          fileData.push(readPdfFile(event.target.files.item(i) as File))
        } else if (event.target.files.item(i)?.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          fileData.push(readDocxFile(event.target.files.item(i) as File))
        }
      }
    }
    setError(null)

    const _files = await Promise.all(fileData)
    setFiles(_files)
    setSize(_files.map((file) => file.size).reduce((a, b) => a + b, 0));
  };

  const onSubmit = async () => {
    if (!files.length) return
    setLoading(true)

    try {
      const { urls, document } = await createUploadFileUrls.mutateAsync({
        projectId: project.id,
        orgId: org.id,
        fileNames: files.map((file) => file.fileName)
      })

      const uploadFilePromises = files.map(async (file, index) => {
        if (urls[index]) {
          const body = new FormData();
          body.append("file", file.data);

          const response = await fetch(urls[index]!, {
            method: "PUT",
            body
          });

          return response
        }
      })


      await Promise.all(uploadFilePromises)

      await indexFileDocument.mutateAsync({ projectId: project.id, orgId: org.id, documentId: document.id })
      await router.push(`/dashboard/${org.name}/${project.slug}/documents`)
    } catch (error) {
      console.log(error)
      toast.error('Something went wrong, contact support')
    }
    setLoading(false)
  }

  const removeFileSelection = (index: number) => {
    const _files = [...files]
    _files.splice(index, 1)
    setFiles(_files)
    setSize(_files.map((file) => file.size).reduce((a, b) => a + b, 0));
  }

  const limits = getLimits(org.plan)
  const quota = (limits.documentSize - Number(org.documentTokens)) / 1e3

  const isQuotaExceeded = size / 1000 > quota

  return (
    <div>
      <div className="mt-4">
        <input id="file-btn" type="file" name="document" onChange={uploadToClient} accept=".pdf,.docx,.txt" multiple hidden />
        <div className="border border-gray-300 rounded flex">
          <label className="border border-black p-2 px-4 rounded cursor-pointer hover:bg-gray-100 flex items-center w-fit shrink-0" htmlFor="file-btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
            </svg>
            <p className="ml-2">
              Choose files
            </p>
          </label>
          <div className="flex items-center px-2 text-ellipsis whitespace-nowrap overflow-hidden">
            {files.length === 0 ? 'Supported format: .txt, .pdf, .docx' : files.length > 1 ? `${files.length} files selected` : files[0]?.fileName}
          </div>
        </div>
        <div className="text-zinc-600 mt-2 text-sm">Note: File size limit is 50MB, the size shown below is plain text size and not file size</div>
        {error ? <div className="mt-2 text-red-500">{error}</div> : null}
        {files.length > 0 ? (
          <div className="mt-10">
            <p className="text-zinc-500">Selected files</p>
            <div className="max-h-[50vh] border border-gray-400 rounded-md w-full overflow-auto">
              {files.map((doc, i) => (
                <div key={doc.fileName} className={`p-2 border-b flex justify-between last:border-none last:rounded-b-md first:rounded-t-md`}>
                  <div>
                    {doc.fileName}
                  </div>
                  <div className="flex gap-4 items-center">
                    <p className="text-zinc-600">
                      {(doc.size / 1000).toFixed(1)} KB
                    </p>
                    <button onClick={() => removeFileSelection(i)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end p-2">
              <div>
                <div>
                  <span className="text-zinc-500">Total: </span>
                  <span className={`${isQuotaExceeded ? 'text-red-500' : 'text-green-500'}`}>{size / 1000} KB</span>
                </div>
                <div>
                  <span className="text-sm text-zinc-500">Quota left:  </span>
                  <span className="text-sm">{quota < 0 ? 0 : quota} KB</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <PrimaryButton className="mt-10 mx-auto" disabled={loading || files.length < 1 || isQuotaExceeded || !!error} loading={loading} onClick={onSubmit}>Submit</PrimaryButton>
    </div>
  )
}
