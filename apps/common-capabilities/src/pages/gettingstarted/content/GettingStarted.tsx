import React from 'react';
import { Link } from 'react-router-dom';
import { GoASpacer } from '@abgov/react-components';

export default function renderGettingStarted() {
  return (
    <>
      <h1 id="getting-started">Getting started</h1>
      <h2>What do we mean by services?</h2>
      <p>
        Services on common capabilities are the digital tools, software, code,
        and APIs built by enterprise, platform, product, and portfolio teams in
        the Government of Alberta. These services are standalone but work
        alongside other services and are reusable or can be repurposed depending
        on the business context.
      </p>
      <GoASpacer vSpacing="s" />
      <h2>What kind of services does common capabilities feature? </h2>
      <p>
        Common capabilities features two kinds of services:
        <ol className="goa-ordered-list">
          <li>
            <b>Recommended services:</b> Recommended components built for the
            DDD product teams to reuse or repurpose as per their use case and
            development needs. Recommended components are usually provided by
            the following enterprise and DDD platform teams:
            <ul className="goa-unordered-list">
              <li>Alberta.ca</li>
              <li>Service Integrations</li>
              <li>1GX</li>
              <li>CloudOps</li>
              <li>Enterprise Solutions</li>
              <li>Alberta Digital Service Platform (ADSP)</li>
            </ul>
            <Link to="/ecosystem">
              Learn more about the teams and the GoA eco-system
            </Link>
          </li>
          <GoASpacer vSpacing="s" />
          <li>
            <p>
              <b>Services built to serve specific use cases</b> and are not
              standard or reusable for the DDD product teams. These services are
              built by portfolio platform teams in ministries that have distinct
              requirements.
            </p>
            <p>The ministries that have portfolio platform teams include: </p>
            <ul className="goa-unordered-list">
              <li>Seniors, Community and Social Services (SCSS) Platform</li>
              <li>Children and Family Services (CFS) Platform</li>
              <li>Justice Digital</li>
              <li>Advanced Education (AE) Digital</li>
              <li>Wildfire Platform</li>
            </ul>
          </li>
        </ol>
        <Link to="/services">Explore services → </Link>
      </p>
      <GoASpacer vSpacing="l" />

      <h2>What do we mean by “reuse” or “repurpose”?</h2>
      <p>
        Though standard services are designed as common components for DDD
        product teams, it does not imply that the standard services are always
        ready to use.
      </p>
      <p>
        Product teams can either reuse the standard service as it is if it fits
        the requirements or make tweaks to the service to align it with their
        needs.
      </p>
      <p>
        By reuse or repurpose we mean that while the service framework or code
        is ready and fully functional, product teams should assess the service
        thoroughly with the service provider team and utilize it by making
        necessary modifications.
      </p>

      <GoASpacer vSpacing="l" />
      <h2>
        How common capabilities is different from other similar resources that
        exist within GoA?
      </h2>
      <p>
        Common capabilities is a directory that gives you an aggregated and
        comprehensive list of all services that exist within GoA for you to
        explore, review, compare, and evaluate as per your use case and
        development needs in one single place.
      </p>
      <p>
        Some provider teams offer their own repositories of service
        documentation. These repositories only include the services and
        resources that the respective provider team owns or maintains.
      </p>

      <p>
        You may be familiar or may come across some of the repositories listed
        below:
        <ol className="goa-ordered-list">
          <li>
            <Link to="https://abgov.sharepoint.com/sites/S500D27-SI969/SitePages/SPO-Home.aspx">
              Integration improvement
            </Link>
            : A repository of services owned and maintained by the Service
            Integration team.
          </li>

          <li>
            <Link to="https://abgov.sharepoint.com/sites/S500D27-SI969/SitePages/SPO-Home.aspx">
              ADSP
            </Link>
            : A repository of services owned and maintained by the Alberta
            Digital Services Platform (ADSP).
          </li>

          <li>
            <Link to="https://bernie.gov.ab.ca/esm?id=sc_cat_item&sys_id=f3769a161b0a451464f6b99f034bcbdc">
              GitHub
            </Link>
            : Repository to obtain code that can be accessed by generating a
            request on Bernie.
          </li>
        </ol>
      </p>
    </>
  );
}
