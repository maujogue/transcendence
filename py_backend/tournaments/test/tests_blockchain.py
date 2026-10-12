from unittest.mock import patch, MagicMock

from django.test import TestCase
from django.urls import reverse

from tournaments import blockchain
from tournaments.models import Tournament
from tournaments.signals import get_receipt_address


class ReceiptAddressTest(TestCase):
	def setUp(self):
		self.tournament = Tournament.objects.create(name='chaintest', max_players=2)

	@patch('tournaments.signals.set_data_on_blockchain')
	def test_successful_transaction_stores_hash(self, mock_set_data):
		mock_set_data.return_value = {'transactionHash': bytes.fromhex('ab' * 32)}
		get_receipt_address(self.tournament)
		self.tournament.refresh_from_db()
		self.assertEqual(self.tournament.receipt_address, 'ab' * 32)

	@patch('tournaments.signals.set_data_on_blockchain')
	def test_failed_transaction_marks_unavailable(self, mock_set_data):
		mock_set_data.return_value = None
		get_receipt_address(self.tournament)
		self.tournament.refresh_from_db()
		self.assertEqual(self.tournament.receipt_address, blockchain.RECEIPT_UNAVAILABLE)

	@patch('tournaments.blockchain.HTTPProvider')
	@patch('tournaments.blockchain.Web3')
	@patch.multiple('tournaments.blockchain', WALLET=None, PRIVATE_KEY=None,
				 PROVIDER_URL=None, CONTRACT_ADDRESS=None)
	def test_missing_config_skips_network(self, mock_web3, mock_provider):
		tournament = MagicMock()
		tournament.get_winner.return_value = 'winner'
		tournament.matchups.all.return_value = []
		self.assertIsNone(blockchain.set_data_on_blockchain(tournament))
		mock_web3.assert_not_called()
		mock_provider.assert_not_called()

	def test_receipt_endpoint_returns_unavailable(self):
		self.tournament.receipt_address = blockchain.RECEIPT_UNAVAILABLE
		self.tournament.save()
		response = self.client.get(reverse('return_receipt_address', args=[self.tournament.pk]))
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json()['receipt_address'], blockchain.RECEIPT_UNAVAILABLE)
