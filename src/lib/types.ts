export type ListingStatus = 'draft'|'pending_review'|'active'|'matched'|'expired'|'removed'
export type ListingType = 'private_room'|'shared_room'|'sublease'|'lease_transfer'|'whole_unit'
export type UserRole = 'seeker'|'poster'|'admin'
export type ReportStatus = 'open'|'under_review'|'resolved'|'dismissed'

export interface Profile {
  id: string; full_name: string|null; school: string|null
  gender: string|null; gender_pref: string|null
  budget_min: number|null; budget_max: number|null
  move_in_date: string|null; bio: string|null
  role: UserRole; avatar_path: string|null
  created_at: string; updated_at: string
}

export interface Listing {
  id: string; owner_id: string; type: ListingType; status: ListingStatus
  neighborhood: string|null; city: string; state: string; zipcode: string|null
  rent: number; deposit: number|null; utilities_included: boolean
  furnished: boolean; private_room: boolean; gender_pref: string|null
  available_from: string; available_to: string|null
  title: string; description: string|null
  created_at: string; updated_at: string
  last_refreshed_at: string; deleted_at: string|null
}

export interface ListingPhoto {
  id: string; listing_id: string; storage_path: string
  sort_order: number; created_at: string
}

export interface ListingCompliance {
  id: string; listing_id: string
  landlord_consent_required: boolean; landlord_consent_available: boolean
  lease_doc_available: boolean; transfer_fee: number|null
  prime_tenant_confirmed: boolean; updated_at: string
}

export interface SavedListing { user_id: string; listing_id: string; created_at: string }

export interface ChatThread {
  id: string; listing_id: string; seeker_id: string; poster_id: string
  created_at: string; updated_at: string
}

export interface Message {
  id: string; thread_id: string; sender_id: string; body: string; sent_at: string
}

export interface Report {
  id: string; listing_id: string; reporter_id: string
  reason: string; status: ReportStatus; notes: string|null
  created_at: string; updated_at: string
}

export interface ListingWithDetails extends Listing {
  listing_photos: ListingPhoto[]
  profiles: Pick<Profile,'id'|'full_name'|'avatar_path'|'school'>
  listing_compliance: ListingCompliance|null
  is_saved?: boolean
}

export interface ThreadWithDetails extends ChatThread {
  listings: Pick<Listing,'id'|'title'|'rent'|'city'>
  seeker_profile: Pick<Profile,'id'|'full_name'|'avatar_path'>
  poster_profile: Pick<Profile,'id'|'full_name'|'avatar_path'>
  last_message?: Pick<Message,'body'|'sent_at'>
}

export type Database = {
  public: {
    Tables: {
      profiles:            { Row: Profile;            Insert: Partial<Omit<Profile,'created_at'|'updated_at'>> & {id:string}; Update: Partial<Omit<Profile,'id'|'created_at'>> }
      listings:            { Row: Listing;            Insert: Omit<Listing,'id'|'created_at'|'updated_at'|'last_refreshed_at'>; Update: Partial<Omit<Listing,'id'|'created_at'>> }
      listing_compliance:  { Row: ListingCompliance;  Insert: Omit<ListingCompliance,'id'|'updated_at'>; Update: Partial<Omit<ListingCompliance,'id'>> }
      listing_photos:      { Row: ListingPhoto;       Insert: Omit<ListingPhoto,'id'|'created_at'>; Update: Partial<Omit<ListingPhoto,'id'>> }
      saved_listings:      { Row: SavedListing;       Insert: SavedListing; Update: never }
      chat_threads:        { Row: ChatThread;         Insert: Omit<ChatThread,'id'|'created_at'|'updated_at'>; Update: Partial<Omit<ChatThread,'id'|'created_at'>> }
      messages:            { Row: Message;            Insert: Omit<Message,'id'|'sent_at'>; Update: never }
      reports:             { Row: Report;             Insert: Omit<Report,'id'|'created_at'|'updated_at'>; Update: Partial<Omit<Report,'id'|'created_at'>> }
    }
  }
}

export function formatRent(cents: number) {
  return `$${Math.round(cents/100).toLocaleString('en-US')}/mo`
}
export function formatDeposit(cents: number|null) {
  return cents ? `$${Math.round(cents/100).toLocaleString('en-US')}` : 'No deposit'
}

export const LISTING_TYPE_LABELS: Record<ListingType,string> = {
  private_room:'Private room', shared_room:'Shared room', sublease:'Sublease',
  lease_transfer:'Lease transfer', whole_unit:'Whole unit',
}
export const SPRINGFIELD_NEIGHBORHOODS = [
  'Downtown','Midtown','Near Missouri State','Near Drury University',
  'Near Evangel University','North Springfield','South Springfield',
  'East Springfield','West Springfield','Republic Road','Battlefield',
  'Commercial Street','Galloway',
]
