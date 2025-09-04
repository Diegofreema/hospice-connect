/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Id } from '@/convex/_generated/dataModel';
import { ReactMutation } from 'convex/react';
import { FunctionReference } from 'convex/server';
import { ConvexError } from 'convex/values';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Device type detection
const isTablet = width >= 768;
const isLargePhone = width >= 414;
const isSmallPhone = width <= 320;

export const getFontSize = (baseSize: number) => {
  if (isTablet) {
    return baseSize * 1.3;
  } else if (isLargePhone) {
    return baseSize * 1.1;
  } else if (isSmallPhone) {
    return baseSize * 0.9;
  }
  return baseSize;
};

export const generateErrorMessage = (
  error: unknown,
  message: string
): string => {
  let errorMessage = message;

  if (error instanceof ConvexError) {
    const { message: errMessage } = error.data;
    errorMessage = errMessage;
  }
  return errorMessage;
};

export function validateFields(fieldsToValidate: string[], values: any) {
  // Check each field in the fieldsToValidate array
  for (const field of fieldsToValidate) {
    // Check if field exists in values and if it's empty
    if (
      !values[field] ||
      values[field] === '' ||
      values[field] === null ||
      values[field] === undefined
    ) {
      return false; // Return false if any field is empty
    }
  }
  return true; // Return true if all fields have values
}

export const uploadProfilePicture = async (
  generateUploadUrl: ReactMutation<
    FunctionReference<'mutation', 'public', {}, string, string | undefined>
  >,
  selectedImage?: string
): Promise<{ storageId: Id<'_storage'>; uploadUrl: string } | undefined> => {
  try {
    if (!selectedImage) return;
    const uploadUrl = await generateUploadUrl();

    const response = await fetch(selectedImage);
    const blob = await response.blob();

    const result = await fetch(uploadUrl, {
      method: 'POST',
      body: blob,
      headers: { 'Content-Type': 'image/jpeg' },
    });
    const { storageId } = await result.json();

    return { storageId, uploadUrl };
  } catch (error) {
    console.log({ error });
  }
};
