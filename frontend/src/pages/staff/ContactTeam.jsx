import React from 'react';
import { ContactInfo, Footer, Navigation } from '../../components/common';

function ContactTeam() {
  return (
    <div>
      <Navigation username={'Mike Junior'} contactTeamColor={'primary'}/>
      <div id="carouselExample" className="carousel">
        <div className="carousel-inner"></div>
      </div>
      <ContactInfo />
      <Footer />
    </div>
  );
}

export default ContactTeam;
