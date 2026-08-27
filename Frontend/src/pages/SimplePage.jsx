const pageContent = {
  home: ['Home Page', 'This is Home page component.'],
  panchayatInfo: ['Panchayat Info Page', 'This is Panchayat Info page component.'],
  citizenServices: ['Citizen Services Page', 'This is Citizen Services page component.'],
  birthDeathRegistration: [
    'Birth Death Registration Page',
    'This is Birth Death Registration page component.',
  ],
  propertyTax: ['Property Tax Page', 'This is Property Tax page component.'],
  waterSupply: ['Water Supply Page', 'This is Water Supply page component.'],
  complaints: ['Complaints Page', 'This is Complaints page component.'],
  schemes: ['Schemes Page', 'This is Schemes page component.'],
  gallery: ['Gallery Page', 'This is Gallery page component.'],
  noticeBoard: ['Notice Board Page', 'This is Notice Board page component.'],
  contact: ['Contact Page', 'This is Contact page component.'],
  profile: ['Profile Page', 'This is Profile page component.'],
  logout: ['Logout Page', 'This is Logout page component.'],
  adminLogin: ['Admin Login', 'This is Admin Login page.'],
  workerLogin: ['Worker Login', 'This is Worker Login page.'],
  userLogin: ['User Login', 'This is User Login page.'],
};

function SimplePage({ pageKey }) {
  const [title, description] = pageContent[pageKey] || pageContent.home;

  return (
    <>
      <h2 className="text-4xl font-black text-neutral-950">{title}</h2>
      <p className="mt-5 text-lg text-neutral-700">{description}</p>
    </>
  )
}

export default SimplePage
