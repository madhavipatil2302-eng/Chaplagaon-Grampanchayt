export const role = {
  applicationAdmin: 'ApplicationAdmin',
  sarpanch: 'sarpanch',
  deputySarpanch: 'DeputySarpanch',
  upSarpanch: 'UpSarpanch',
  gramSevak: 'GramSevak',
  talathi: 'Talathi',
  wardMember: 'WardMember',
  clerk: 'Clerk',
  operator: 'Operator',
  waterSupplyWorker: 'WaterSupplyWorker',
  taxOfficer: 'TaxOfficer',
}

export const roleOptions = [
  { label: 'Sarpanch', value: role.sarpanch },
  { label: 'Up-Sarpanch / Deputy Sarpanch', value: role.deputySarpanch },
  { label: 'Up-Sarpanch', value: role.upSarpanch },
  { label: 'Gram Sevak', value: role.gramSevak },
  { label: 'Talathi', value: role.talathi },
  { label: 'Ward Member', value: role.wardMember },
  { label: 'Clerk', value: role.clerk },
  { label: 'Computer Operator', value: role.operator },
  { label: 'Water Supply Worker', value: role.waterSupplyWorker },
  { label: 'Tax Officer', value: role.taxOfficer },
]

export const allPanchayatRoles = Object.values(role)
