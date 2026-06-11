export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePicture?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  status?: string;

  address?: UserAddress | null;

  createdAt?: string;
  updatedAt?: string;
}

export interface UserAddress {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth?: string | null;
  gender?: string | null;
}

export interface AddressSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface AddressSuggestionsResponse {
  success: boolean;
  message: string;
  data: AddressSuggestion[];
}

export interface UpdateAddressPayload {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}