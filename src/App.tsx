import React from 'react';

import { GlobalInfoProvider } from "./context/globalInfo";
import { PageWrapper } from "./pages/PageWrappper";

function App () {

  return (
    <GlobalInfoProvider>
      <PageWrapper/>
    </GlobalInfoProvider>
  );
}

export default App;
