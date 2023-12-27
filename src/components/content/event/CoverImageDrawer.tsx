import { Button, Drawer, ImageUpload } from '@unlock-protocol/ui'
import { MetadataFormData, formDataToMetadata } from '@unlock-protocol/core'
import { useState } from 'react'
import { useUpdateMetadata } from '~/hooks/metadata'
import { useImageUpload } from '~/hooks/useImageUpload'
import { useLockManager } from '~/hooks/useLockManager'
import { useTranslation } from 'next-i18next'

interface CoverImageDrawerProps {
  image: string
  setImage: (image: string) => void
  lockAddress: string
  network: number
  metadata: MetadataFormData
  handleClose: () => void
}

export const CoverImageDrawer = ({
  image,
  setImage,
  lockAddress,
  network,
  metadata,
  handleClose,
}: CoverImageDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { isManager: isLockManager } = useLockManager({
    lockAddress,
    network,
  })
  const { t } = useTranslation()

  const { mutateAsync: uploadImage, isLoading: isUploading } = useImageUpload()

  const { mutateAsync: updateMetadata, isLoading } = useUpdateMetadata({
    lockAddress,
    network,
  })

  const coverImage = metadata.ticket?.event_cover_image

  const onSubmit = async () => {
    const metadataObj = formDataToMetadata({
      ...metadata,
      ticket: {
        ...metadata?.ticket,
        event_cover_image: image,
      },
    })
    await updateMetadata(metadataObj)
    setIsOpen(false)
    handleClose()
  }

  return (
    <div className="relative inset-0 z-[1]">
      {isLockManager && (
        <Button
          className="absolute bottom-3 right-3 md:bottom-8 nd:right-9"
          variant="secondary"
          size="tiny"
          onClick={() => {
            setIsOpen(true)
            setImage(coverImage || '')
          }}
        >
          {coverImage ? t("events.coverImg.change") : t("events.coverImg.upload")}
        </Button>
      )}
      <div className="relative">
        <Drawer isOpen={isOpen} setIsOpen={setIsOpen} title={t("events.coverImg.title")}>
          <div className="z-10 mt-2 space-y-6">
            <ImageUpload
              size="full"
              description={t("events.coverImg.desc")}
              preview={image}
              isUploading={isUploading}
              imageRatio="cover"
              onChange={async (fileOrFileUrl: any) => {
                if (typeof fileOrFileUrl === 'string') {
                  setImage(fileOrFileUrl)
                } else {
                  const items = await uploadImage(fileOrFileUrl[0])
                  const image = items?.[0]?.publicUrl
                  if (!image) {
                    return
                  }
                  setImage(image)
                }
              }}
            />
          </div>
          <Button
            className="w-full"
            size="small"
            type="submit"
            onClick={onSubmit}
            loading={isLoading}
            disabled={image === coverImage}
          >
            {t("common.save")}
          </Button>
        </Drawer>
      </div>
    </div>
  )
}
