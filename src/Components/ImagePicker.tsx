
import React, { useCallback } from 'react';
import SingleFilePicker, { SingleFilePickerProps } from './SingleFilePicker';

interface ImagePickerProps extends SingleFilePickerProps {
  width: number;
  height: number;
  type: string;
  exact?: boolean;
}

export default function ImagePicker(props: ImagePickerProps) {
  const { width, height, type, exact } = props;

  const transform = useCallback(async function(file) {
    const modalCropper = await import('modal-cropper');
    const modalCropperFnc = modalCropper.default || modalCropper;
    return await modalCropperFnc(file, width, height, type, exact);
  }, [ width, height, type, exact ]);

  return <SingleFilePicker
    {...props}
    transform={transform}
    accepts="image/png, image/jpeg"
  />;
}
