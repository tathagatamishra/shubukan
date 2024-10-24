import { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, StarOff, Trash2, Search, ChevronUp, ChevronDown } from 'lucide-react';
import './Admin.scss';

export default function Admin() {
  const [registrations, setRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('name');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await axios.get('https://shubukan-backend.vercel.app/registration');
      // Filter out deleted registrations and sort favorites to top
      const activeRegistrations = response.data.data
        .filter(reg => !reg.isDeleted)
        .sort((a, b) => {
          if (a.isFavorite !== b.isFavorite) return b.isFavorite ? 1 : -1;
          return 0;
        });
      setRegistrations(activeRegistrations);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const toggleFavorite = async (id) => {
    try {
      const registration = registrations.find(r => r._id === id);
      await axios.put(`https://shubukan-backend.vercel.app/registration/${id}`, {
        ...registration,
        isFavorite: !registration.isFavorite
      });
      fetchRegistrations();
    } catch (error) {
      console.error('Error updating favorite status:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.put(`https://shubukan-backend.vercel.app/registration/${id}`, {
        isDeleted: true
      });
      fetchRegistrations();
    } catch (error) {
      console.error('Error deleting registration:', error);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedRegistrations = () => {
    const filteredRegistrations = registrations.filter(reg => {
      if (!searchTerm) return true;
      return reg[searchField]?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });

    return filteredRegistrations.sort((a, b) => {
      let compareA = a[sortField];
      let compareB = b[sortField];

      if (sortField === 'age') {
        compareA = new Date(a.dob);
        compareB = new Date(b.dob);
      }

      if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  return (
    <div className="AdminDashboard">
      <section className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage Registrations</p>
        <div className="underline"></div>
      </section>

      <section className="search-section">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder={`Search by ${searchField}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
          >
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="state">State</option>
          </select>
        </div>
      </section>

      <section className="registrations-table">
        <table>
          <thead>
            <tr>
              <th>Favorite</th>
              <th onClick={() => handleSort('name')}>
                Name {sortField === 'name' && (sortDirection === 'asc' ? <ChevronUp /> : <ChevronDown />)}
              </th>
              <th>Email</th>
              <th>Phone</th>
              <th onClick={() => handleSort('state')}>
                State {sortField === 'state' && (sortDirection === 'asc' ? <ChevronUp /> : <ChevronDown />)}
              </th>
              <th onClick={() => handleSort('age')}>
                Age {sortField === 'age' && (sortDirection === 'asc' ? <ChevronUp /> : <ChevronDown />)}
              </th>
              <th onClick={() => handleSort('gender')}>
                Gender {sortField === 'gender' && (sortDirection === 'asc' ? <ChevronUp /> : <ChevronDown />)}
              </th>
              <th>Karate Exp.</th>
              <th>Other MA Exp.</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getSortedRegistrations().map((registration) => (
              <tr key={registration._id}>
                <td>
                  <button 
                    className="icon-button"
                    onClick={() => toggleFavorite(registration._id)}
                  >
                    {registration.isFavorite ? <Star className="star-filled" /> : <StarOff />}
                  </button>
                </td>
                <td>{registration.name}</td>
                <td>{registration.email}</td>
                <td>{registration.phone}</td>
                <td>{registration.state}</td>
                <td>{registration.age}</td>
                <td>{registration.gender}</td>
                <td>{registration.karateExperience}</td>
                <td>{registration.otherMartialArtsExperience}</td>
                <td>
                  <button 
                    className="icon-button delete"
                    onClick={() => handleDelete(registration._id)}
                  >
                    <Trash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}