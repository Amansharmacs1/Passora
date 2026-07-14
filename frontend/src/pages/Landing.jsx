import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BsShieldLock, BsDeviceSsd, BsLightningCharge } from 'react-icons/bs';
import Button from '../components/Button';

const Landing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-500 overflow-hidden">
      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
            Secure your digital life with <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">Passora</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto mb-10">
            A beautiful, intelligent, and highly secure password manager designed for modern teams and individuals.
          </motion.p>
          <motion.div variants={itemVariants} className="flex justify-center items-center gap-4">
            <Link to="/register" className="inline-block">
              <Button variant="primary" className="text-lg px-8 py-4">Get Started for Free</Button>
            </Link>
            <Link to="/login" className="inline-block">
              <Button variant="outline" className="text-lg px-8 py-4">Sign In</Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Features */}
      <div className="bg-white dark:bg-gray-800 py-24 transition-colors duration-500 border-y border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Everything you need</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: 'Military-Grade Security', desc: 'End-to-end encryption ensures only you have access to your passwords.', icon: BsShieldLock },
              { title: 'Sync Across Devices', desc: 'Access your vaults seamlessly from your desktop, tablet, or phone.', icon: BsDeviceSsd },
              { title: 'Lightning Fast', desc: 'Built for speed and productivity with an intuitive interface.', icon: BsLightningCharge },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-8 rounded-2xl glass-hover text-center flex flex-col items-center"
              >
                <div className="h-16 w-16 bg-primary-100 dark:bg-primary-900/50 rounded-2xl flex items-center justify-center mb-6 text-primary-600 dark:text-primary-400">
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA */}
      <div className="py-24 relative">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Ready to upgrade your security?</h2>
          <Link to="/register">
            <Button variant="primary" className="text-lg px-10 py-4 shadow-xl shadow-primary-500/20">Join Passora Today</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;
