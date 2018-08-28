export default `
  query getUser($id: ID!) {
    getUser(id: $id) {
      id
      username 
      bars {
        items {
          id
          createdAt
          name
          phone
          location
          lat
          lng
          url
          addedBy
          __typename
        }  
        __typename    
      }
      __typename
    }
  }
`;
